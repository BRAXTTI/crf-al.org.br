# Revisão geral do projeto — 20/10/2026

Base local: commit `5327e34`. Revisão de código, dependências, imports estáticos e dinâmicos, configurações, scripts, assets públicos, Functions, complemento WordPress e documentação. Verificações pontuais do site publicado em `https://institucional.crf-al.org.br`.

Nenhum código da aplicação foi alterado. Este relatório é o único arquivo adicionado. Arquivos locais não versionados foram preservados.

## Resultado geral

A organização por features funciona e as páginas internas já são divididas em chunks. Não encontrei módulos inteiros de `src` sem caminho de importação a partir da aplicação, considerando as rotas dinâmicas. Existem funções, componentes auxiliares e uma variante visual sem consumidores atuais.

Todas as dependências diretas de produção têm uso identificado. Não há fundamento para remover React Query, Radix, DOMPurify, Helmet, `clsx` ou `tailwind-merge` como dependências mortas. Os maiores ganhos confirmados estão em evitar downloads desnecessários e corrigir inconsistências funcionais e nas verificações do projeto.

Prioridades: **P2** = correção normal, com impacto funcional ou técnico relevante; **P3** = manutenção e simplificação. Não foi identificado um problema P0/P1 nesta revisão. Isso não substitui uma auditoria especializada de segurança.

## Achados prioritários

### 1. P2 — Imagem de desktop baixa mesmo quando está oculta no celular

**Local:** `src/components/block/page-hero.tsx:274`.

O `CompactHero` mantém um `<img src=...>` com `hidden lg:block`. A regra CSS esconde a imagem, mas o navegador ainda a requisita. Na página `/servicos/requerimentos`, com viewport de 390 × 844, confirmei `display: none`, largura natural de 2108 pixels e a requisição de `page-hero-desktop-v3.webp`, com **79.342 bytes de corpo codificado**.

**Correção:** disponibilizar a arte somente a partir de 1024px, por exemplo como background dentro da media query, ou usando `<picture>` com fonte desktop e fallback que não baixe a arte no celular. A imagem é decorativa. Economia direta aproximada: **79 kB em uma visita mobile sem cache** às páginas que usam esse cabeçalho.

### 2. P2 — O filtro de notícias considera somente a página atual

**Local:** `src/features/press/pages/NewsPage.tsx:141` e `functions/_news.ts:101`.

`usePosts(page, 12)` busca uma página geral; depois `filteredPublications` filtra apenas esses 12 resultados no navegador. Uma categoria pode mostrar “Nenhuma notícia encontrada” mesmo com notícias existentes em outras páginas. A paginação mantém os totais gerais e trocar de página ainda redefine a categoria para `all`. A própria paginação deixa de aparecer quando o subconjunto filtrado está vazio.

**Correção:** filtrar antes da paginação na API e incluir o filtro na query key, com totais correspondentes. A implementação precisa contemplar as duas origens de notícias e o acervo histórico. Alternativamente, remover o filtro global aparente ou identificá-lo claramente como filtro apenas desta página.

### 3. P2 — Erro temporário da galeria gera `noindex`

**Local:** `src/features/press/pages/PhotoAlbumPage.tsx:65`.

`noindex={isError}` trata da mesma maneira álbum inexistente, HTTP 503, timeout e falha de rede. Assim, uma URL válida pode receber `noindex, nofollow` no HTML renderizado pelo cliente durante uma indisponibilidade temporária. O middleware já diferencia corretamente 404 de 503, mas a página React não preserva essa distinção.

**Correção:** usar `noindex` somente quando `error instanceof GalleryApiError && error.status === 404`. Manter conteúdo previamente carregado e oferecer nova tentativa para os demais erros.

### 4. P2 — Build e lint deixam parte do backend sem verificação efetiva

**Locais:** `eslint.config.js:11`, `tsconfig.app.json:33`, `tsconfig.node.json:25`, `functions/_middleware.ts:37`.

O ESLint aplica regras somente a `ts/tsx`. A configuração efetiva de `functions/api/instagram.js` contém **zero regras**, embora o comando termine com sucesso. O mesmo problema alcança a Function do CFF e scripts JavaScript.

O TypeScript verifica `src` e `vite.config.ts`, incluindo os helpers transitivamente importados pelo Vite. Entretanto, `_middleware.ts` e os entrypoints de Functions não são cobertos. Um exemplo concreto escondido pelo build atual: `PagesContext.next` é declarado sem argumentos, mas é chamado com um `Request` na linha 263. Uma verificação direta identifica `Expected 0 arguments, but got 1`, além da ausência dos tipos de `HTMLRewriter` nesse contexto de compilação.

**Correção:** criar configuração TypeScript específica para Functions com tipos da plataforma e usar o contexto oficial; configurar ESLint também para JS/MJS/CJS, separando ambientes Node, navegador e Cloudflare. Incluir essas verificações em um comando agregado.

### 5. P2 — CSS duplicado quebra a preferência por movimento reduzido

**Locais:** `src/App.css:4` e `src/index.css:474`.

`index.css` define `scroll-behavior: auto` para `prefers-reduced-motion`, dentro de `@layer base`. `App.css` volta a definir `html { scroll-behavior: smooth }` fora das layers, prevalecendo na cascata.

**Reprodução no site publicado:** após emular movimento reduzido, `matchMedia('(prefers-reduced-motion: reduce)').matches` retornou `true`, mas o estilo computado de `html.scrollBehavior` continuou sendo `smooth`.

**Correção:** consolidar estilos globais e foco em um único lugar e preservar o bloco de impressão de `App.css`. Verificar também chamadas explícitas de `scrollIntoView({ behavior: 'smooth' })`.

### 6. P2 — Estrutura de conteúdo e modal têm inconsistências de acessibilidade

**Locais:** `src/components/layout/Layout.tsx:13` e `src/features/services/components/TopDestaques.tsx:159`.

O layout já cria o landmark `<main>`, mas oito páginas criam outro `<main>` dentro dele: Contato, Eventos, Política de Privacidade, Publicações do CFF, Detalhe de Notícia, Manual, Ouvidoria e Requerimentos. Confirmei dois elementos `main` no DOM de Requerimentos.

O `ReelsViewer` implementa um modal próprio com `aria-modal`, foco inicial e bloqueio de scroll, mas sem contenção de foco, sem tornar o fundo inerte e sem restauração explícita do foco ao fechar. Tab pode sair do modal. O projeto já possui essas funcionalidades no Dialog do Radix.

**Correção:** reservar `<main>` ao layout; usar `<section>`/`div` nas páginas. Reutilizar o Dialog no visualizador de reels, mantendo sua apresentação e os controles de vídeo. O problema do modal foi identificado pela implementação; não foi realizado um teste completo de leitor de tela.

## Código morto e itens que podem ser simplificados

| Item | Evidência | Ação indicada |
| --- | --- | --- |
| `useInstagramFeed` em `src/services/wordpress/hooks.ts:55` | Nenhum consumidor. O componente atual consulta `/api/instagram` diretamente. | Remover o hook antigo. |
| `fetchInstagramFeed` em `src/services/wordpress/client.ts:93` | Usado somente pelo hook morto; consulta a integração antiga `/crfal/v1/instagram`. | Remover junto com o hook. |
| `CRFInstagramPost` em `src/services/wordpress/types.ts:83` | Usado somente pelo fetch antigo. | Remover depois de remover o fluxo antigo. |
| `PageHeroStats` em `src/components/block/page-hero.tsx:383` | Wrapper de compatibilidade sem chamadas. | Remover. Preservar `PageHeroMeta`, usado internamente. |
| `DialogFooter` em `src/components/ui/dialog.tsx:95` | Sem importações ou chamadas internas. | Remover. Preservar `DialogPortal` e `DialogOverlay`, usados pelo próprio Dialog. |
| Variante `default` de `PageHero` | Há 19 chamadas; nenhuma solicita `default`. O padrão do componente é `compact` e a única variante explícita também é `compact`. Não há spreads de props nessas chamadas. | Simplificar para o cabeçalho atual e remover a implementação antiga, seus defaults e props exclusivas. |
| `backgroundImageMobile`, `eyebrowIcon` e `decoration` de `PageHero` | Não têm consumidores externos; a implementação `compact` não os utiliza. | Remover com a variante antiga; atualizar a documentação. |
| Utilities `btn-gold`, `section-title`, `text-gradient`, `animation-delay-100` até `500` | Sem uso nos componentes. | Remover definições para reduzir manutenção. Tailwind pode já omitir a saída não usada; não presumir economia de download. |
| Tokens/animações `accordion-down/up`, `caret-blink`, `slide-down`, `float` | Sem referências `animate-*` correspondentes no código atual. | Revisar/remover definições sem consumidores. |

**Assets ligados à variante antiga:** depois da simplificação de `PageHero`, os arquivos `public/images/page-hero.webp` (43.522 B), `page-hero-mobile.webp` (94.828 B) e `page-hero-mobile-v3.webp` (53.772 B) ficam candidatos à remoção: **192.122 B** no total. Hoje os dois primeiros ainda são referenciados pela implementação antiga; o terceiro é calculado como default de uma prop que não chega ao `CompactHero`. Não classificá-los como arquivos simplesmente órfãos antes de remover essa implementação. Essa limpeza reduz o pacote de publicação, sem representar economia equivalente na home.

**Export não consumido externamente não significa código morto.** `PageHeroMeta`, `DialogPortal`, `DialogOverlay`, `decodeHTMLEntities`, `statusAtendimento` e `cffColClass` são usados dentro dos próprios módulos. Pode-se reduzir sua API removendo apenas o `export`. O mesmo cuidado vale para os tipos usados internamente, como `NavSubItem`, `NavColumn`, `NavFeature`, `SectionNav` e `PlenaryYear`.

## Desempenho: melhorias com evidência

### Home incluída no carregamento de todas as rotas

**Local:** `src/router/app-router.tsx:4`.

`HomePage` é importada estaticamente. Quem abre uma página interna também baixa o código do slider, dos blocos da home, do Instagram e de outras dependências da home, mesmo sem renderizá-los.

Fiz uma simulação em memória do build trocando apenas essa rota para o mesmo mecanismo `lazy` já usado nas demais. Nenhum arquivo da aplicação foi editado.

| JavaScript inicial compartilhado | Atual | Home sob demanda |
| --- | ---: | ---: |
| Total sem compressão | 550.035 B | 498.228 B |
| Soma gzip por chunk | 170.685 B | 158.133 B |

Economia para entradas diretas em páginas internas: **51.807 B sem compressão / 12.552 B gzip**, cerca de 7,4% do JS inicial comprimido. O código da home continua necessário quando a própria home é acessada; avaliar esse compromisso antes da mudança. Um fallback visível também melhoraria `HydrateFallback: () => null`, que hoje deixa a primeira abertura de uma rota lazy em branco enquanto o chunk chega. [Referência: carregamento sob demanda no React](https://react.dev/reference/react/lazy).

### Cards de notícias ignoram os tamanhos responsivos existentes

**Locais:** `src/components/home/Publications.tsx:20`, `src/features/press/pages/NewsPage.tsx:57`, `src/services/wordpress/client.ts:131`.

Os cards usam a URL original por `getPostImage`, sem `srcSet`/`sizes`. O projeto já tem `mediaImageSet` e `getPostImageSet`, usados no detalhe. A API pública retornou, por exemplo, imagem de 1280 px com variantes de 498 e 768 px, e imagem de 1555 px com variante de 477 px; os cards pequenos continuam escolhendo a original.

Reutilizar o utilitário responsivo, com `sizes` adequados aos cards e fallback para mídia sem variantes. Preservar os filtros de proporção. As duas tags da imagem desfocada/primeiro plano com a mesma URL não implicam automaticamente duas transferências: o navegador pode compartilhar a requisição. A economia exata depende da mídia e do dispositivo e não foi medida.

### Detalhe de evento espera a listagem inteira

**Local:** `src/features/events/pages/EventoDetailPage.tsx:76`.

Em uma entrada direta, a página baixa todos os eventos, procura o slug para descobrir o ID e somente então solicita o detalhe. Se a listagem falhar, o detalhe fica bloqueado. É uma sequência de consultas confirmada pela dependência `useEventById(resumo?.id ?? NaN)`.

Criar consulta por slug e buscar a listagem de relacionados independentemente. Isso exige suporte na API WordPress ou na Function; não basta colocar as chamadas atuais em `Promise.all`, pois a segunda precisa do resultado da primeira.

### Metadados do álbum buscam todas as fotos

**Locais:** `functions/_middleware.ts:128` e `wordpress/crfal-photo-gallery/crfal-photo-gallery.php:65`.

O middleware precisa de título, descrição, slug e capa, mas consulta o endpoint de detalhe completo. O álbum de Arapiraca atualmente tem **265 fotos** e sua resposta JSON mede **68.611 B sem compressão**. Nas conferências adicionais, a origem levou aproximadamente 1,4 s para responder. A listagem PHP também percorre os anexos para montar informações de cada álbum.

Uma resposta resumida ou seleção de campos reduz o payload de metadados; para reduzir trabalho no WordPress, evitar montar todas as fotos quando o pedido precisa apenas de capa/contagem. Não remover a validação de publicação, senha, seleção e ordem do FooGallery. Um 503 transitório foi observado no teste do portal e desapareceu na conferência seguinte; **não foi isolada a causa desse 503**.

### Padronizar o cliente HTTP e as fronteiras entre domínios

O projeto tem estratégias diferentes: `wpRequest` usa um timer que termina quando os headers chegam, antes de `response.json`; galeria usa `AbortSignal.any/timeout`; detalhe de notícia, CFF e Instagram no frontend usam `fetch` sem prazo próprio. Isso dificulta prever cancelamento, timeout e tratamento de erros.

Extrair um pequeno cliente que mantenha o prazo até consumir o corpo, preserve o cancelamento do React Query e diferencie 404 de erro temporário. Mover o fetch do Instagram para a camada de serviço e separar hooks de notícias, eventos e galeria. Compartilhar contratos puros entre Functions e frontend, sem importar módulos dependentes de DOM ou React no backend.

## Estrutura, ferramentas e documentação

- **Dividir os arquivos por responsabilidade.** `TutorialsPage.tsx` tem 703 linhas, `RequirementsPage.tsx` 686 e `EventosPage.tsx` 673. Bons pontos de extração: filtros, listagem, painel/modal de detalhe, reprodução de vídeo e checklist. A divisão melhora manutenção; só melhora download quando acompanhada de uma fronteira de carregamento sob demanda.
- **Centralizar dados institucionais repetidos.** Contatos, horário de atendimento e nomes de setores aparecem em Footer, Contato, Ouvidoria e fiscalização. Usar uma configuração compartilhada evita divergência editorial. Não transformar todo JSX parecido em componente genérico.
- **Corrigir a variável de desenvolvimento do Instagram.** `vite.config.ts:33` lê `process.env.VITE_INSTAGRAM_FEED_URL`, mas não chama `loadEnv`. Um valor colocado apenas em `.env`, conforme orienta `.env.example`, não é carregado automaticamente na avaliação da configuração. Usar `defineConfig(({ mode }) => ...)`, `loadEnv` e passar o valor ao plugin. Valores exportados pelo shell já funcionam. [Referência: configuração e variáveis no Vite](https://vite.dev/config/).
- **Atualizar o README.** Continua sendo o template padrão React/Vite; falta explicar arquitetura, Functions, WordPress, testes e diferenças entre `dev`, `preview` e Pages.
- **Atualizar `.cursor/rules/projeto.mdc`.** Cita Tailwind 3, banners vindos de WordPress, `useBanners`, variável de notícias removida e geração de sitemap durante o build. Hoje são Tailwind 4, banners locais, `/api/news`, Functions e atualização de sitemap separada. Essas instruções podem induzir manutenção incorreta.
- **Agregar testes.** Há scripts úteis para Instagram e galeria sem atalhos no `package.json`, e não há comando único para rodar todas as verificações locais. Separar testes offline de smoke tests contra um ambiente publicado.
- **Remover fixtures editoriais fixas do smoke test.** `scripts/test-page-metadata.mjs:17` exige o título antigo exato de um álbum real. O título atual inclui `30/09/2026`; a resposta pode estar correta e o teste falhar. A cobertura de rotas desse script também procura apenas `element`, embora as páginas tenham migrado para `lazy`; o teste offline de SEO já contempla ambos.

## Arquivos auxiliares e históricos

- `public/images/service-cards-prompts.md` não é um asset do site. O build o copia para `dist/images/`. Mover para documentação ou material de design.
- Três `.DS_Store` locais dentro de `public` foram copiados para `dist`, apesar de ignorados pelo Git. Remover esses resíduos e considerar uma verificação dos arquivos publicados. Não são código da aplicação.
- `CNAME` contém `crf-al.surge.sh`. Não participa do build atual e é candidato a resíduo da hospedagem anterior no Surge; remover se esse fluxo de publicação foi encerrado.
- `analise_titulos.py` depende de `crf-al.WordPress.2026-08-31.xml`, ausente no checkout e ignorado pelo Git. É uma ferramenta pontual de migração, sem integração com a aplicação. Arquivar junto dos materiais de migração ou parametrizar o arquivo de entrada se ainda for útil.
- `video/` (154 MB), `banners-redesign/` (29 MB) e `_atas-recebidas/` (7,8 MB) são materiais locais não versionados. Não entram no build do site. Organizar fontes e saídas geradas separadamente, com regras próprias de versionamento; **não há evidência para apagá-los**. Não foi feita auditoria funcional completa do subprojeto de vídeo.
- Preservar `migration/`, relatórios de SEO, sitemaps e `functions/_news-archive.ts`: têm função histórica/editorial explícita. O acervo não é código morto. Preservar também a compatibilidade das URLs `/publicacao/:slug` e notícias por ID; a implementação pode ser simplificada, mas as rotas antigas ainda precisam de redirecionamento.
- O ZIP do plugin WordPress é um pacote instalável documentado. Não remover como duplicata apenas porque o PHP também está na árvore.

## Verificações realizadas e limites

| Verificação | Resultado |
| --- | --- |
| `npm run build` | Passou; 1.906 módulos transformados. |
| `npm run lint` | Passou, zero erros/avisos; observar a lacuna de regras JS descrita acima. |
| `npm run test:news` | Passou. |
| `npm run test:cff` | Passou. |
| `npm run test:seo` | Passou; 25 rotas estáticas e cenários offline de roteamento/cache/erros. |
| `node scripts/test-instagram.mjs` | Passou. |
| `node scripts/test-photo-gallery.mjs` | Passou. |
| `node scripts/test-page-metadata.mjs https://institucional.crf-al.org.br` | Passou pelas 25 páginas estáticas, mas não completou a suíte: primeiro 503 no álbum; nova tentativa falhou no título editorial fixo desatualizado. |
| Análise de imports/exports | Sem módulos inteiros de aplicação órfãos; achados internos discriminados acima. Imports dinâmicos das rotas foram considerados. |
| Navegador | Home desktop e Requerimentos mobile; recursos, DOM e movimento reduzido. Sem erros JavaScript reportados na consulta da home. |

**Build local:** JavaScript inicial de 550,0 kB, ou 170,7 kB na soma gzip dos chunks. CSS global de 151,2 kB, ou 23,4 kB gzip. O conteúdo de `public` ocupa aproximadamente 45,3 MB, majoritariamente vídeos e documentos sob demanda: isso **não significa** que a home transfira 45 MB.

**Amostras de métricas do site publicado, com cache aquecido e sem limitação de CPU/rede:**

| Página | TTFB | FCP | LCP | CLS |
| --- | ---: | ---: | ---: | ---: |
| Home desktop | 74,6 ms | 168 ms | 168 ms | 0 |
| Requerimentos, viewport 390 × 844 | 38,8 ms | 380 ms | 380 ms | 0 |

Essas amostras rápidas não mostram lentidão geral, mas não representam uma primeira visita em rede móvel. INP não foi obtido; não houve auditoria Lighthouse, coleta de dados de campo ou análise completa de trace. O JavaScript principal e o chunk de PageHero publicados tinham hashes diferentes dos locais; portanto as medições do site e a simulação do build são evidências de ambientes distintos, não uma comparação antes/depois.

O complemento PHP foi inspecionado, mas não executado em um ambiente WordPress/PHP local. Não foram realizadas alterações no WordPress, Cloudflare, dependências ou deploy. Nem todo conteúdo editorial ou link externo foi validado individualmente.

## Ordem sugerida

1. Corrigir filtro de notícias, `noindex` por erro temporário, movimento reduzido e verificações do backend.
2. Evitar a imagem desktop no mobile e aproveitar imagens responsivas nos cards.
3. Remover o fluxo antigo do Instagram, wrappers mortos e a variante antiga de PageHero com seus assets.
4. Unificar o modal de reels e a estrutura de landmarks; dividir páginas grandes.
5. Avaliar home sob demanda e consultas por slug; reduzir o payload usado para metadados da galeria.
6. Atualizar documentação, smoke tests e organização dos materiais auxiliares.
