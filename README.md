# Portal institucional do CRF-AL

React 19 + TypeScript + Vite 7, publicado como SPA no Cloudflare Pages com Pages Functions. O domínio canônico de produção permanece o definido em `src/config/site.ts`. Esse arquivo é a fonte única para frontend, Functions, HTML de build, robots e sitemaps; `VITE_SITE_URL` não é usado, evitando divergência entre build e runtime.

## Desenvolvimento e validação

Requer Node 22.19 ou superior (CI usa Node 22) e npm.

```sh
npm ci
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
```

`npm test` é offline: substitui fetch/cache e cobre timeouts, cancelamento, notícias, categoria editorial, colisões, cache, metadados, 404/503/301, Instagram, CFF, eventos e galeria. `npm run test:metadata` é uma verificação HTTP online separada, destinada a um preview Pages. `npm run preview` serve somente `dist/`: não executa Functions, nem reproduz seus status ou headers. O middleware de desenvolvimento Vite oferece as APIs, mas não simula HTMLRewriter. `npm run audit:browser` executa Lighthouse (inclui regras axe) sobre `/instituicao` no build local: exige Chrome instalado, usa conteúdo estático e não comprova as Functions. CI verifica acessibilidade >= 90 e desempenho >= 70; o build limita cada chunk a 120 KiB gzip e o total JS/CSS a 400 KiB.

`npm run sitemap:refresh` atualiza os arquivos derivados de rotas fixas em `public/`, sem rede. O build gera novamente esses arquivos em `dist/`. **Não há sitemap de notícias estático**: `/sitemap-news.xml` pertence exclusivamente ao middleware. Ele valida os registros históricos contra o inventário publicado na origem; falha temporária resulta em 503 com Retry-After. Eventos e galeria ficam explicitamente noindex, inclusive quando vazios, e fora do sitemap fixo. A instituição pode rever essa política quando houver inventário editorial estável.

## Arquitetura

- `src/router/app-router.tsx`: rotas lazy, layout e catch-all de página não encontrada.
- `src/config/`: contatos institucionais, links, metadados e navegação compartilhados.
- `src/features/`: páginas e componentes por domínio; HTML vindo do WP passa por DOMPurify.
- `src/services/wordpress/`: clientes e TanStack Query; requisições de dados usam APIs da mesma origem.
- `functions/_middleware.ts`: metadados e JSON-LD no HTML inicial, preload LCP, redirects e status. Não criar `_redirects`, `200.html` ou `404.html` na raiz.
- `/api/news`: notícias novas da categoria `noticias-do-portal` e acervo reservado; cache fresco por 60 s, SWR até 10 min. Erros não são guardados.
- `/api/events`, `/api/gallery`: proxy de rotas permitidas, cache de respostas bem-sucedidas por 60 s, timeout, parâmetros validados e 503 com Retry-After em falhas de integração. Detalhes consultam slug/ID, sem baixar o catálogo para resolver metadados.
- `/api/instagram` e `/api/cff-publicacoes`: agregadores existentes. Instagram conserva último resultado válido durante falhas curtas.
- `wordpress/`: plugin de galeria e instruções de instalação no WP; instalação/ativação é tarefa administrativa externa.
- `public/_headers`: CSP, HSTS sem preload e cache. Assets com hash têm immutable; fontes (30 dias) e vídeos (7 dias) usam cache finito porque seus nomes atuais não são versionados. Ao substituir esses arquivos sem mudar o nome, invalidar o cache ou aguardar o TTL.

A SPA continua montando o conteúdo no navegador. Metadados/JSON-LD e status vêm do servidor; isto não equivale a SSR integral. O domínio do WP continua permitido para imagens e vídeos; `connect-src` foi reduzido a self e Cloudflare Insights, pois o navegador não consulta mais REST diretamente.

## Configuração

Copie `.env.example` para `.env` para opções locais de frontend. Nenhum segredo deve usar prefixo `VITE_`.

| Configuração | Onde | Uso |
| --- | --- | --- |
| `SITE_URL` | `src/config/site.ts` | Canônico único; alterar somente com decisão institucional e redirects planejados |
| `WP_SITE_URL` | Pages Functions | Origem WP de eventos/galeria/metadados; padrão WP novo |
| `NEWS_ARCHIVE_API_URL` | Pages Functions | Base REST completa opcional do arquivo migrado; ausente mantém o WP antigo |
| `INSTAGRAM_FEED_URL` | Pages Functions | Origem do HTML do feed Instagram |
| `VITE_INSTAGRAM_FEED_URL` | build/dev | Feed usado pelo middleware Vite local |
| `VITE_INSTAGRAM_PROFILE_URL` | build | Perfil do botão de fallback |
| `VITE_WP_SITE_URL` | build | Base de URLs de uploads; não muda a origem REST das Functions |

As APIs locais de conteúdo usam a origem padrão; validar configurações runtime personalizadas em preview Pages. As origens configuradas devem ser administradas pela instituição, nunca recebidas de parâmetros do usuário. Mudanças de origem de mídia exigem revisão da CSP sem ampliar permissões indiscriminadamente.

### Arquivo de notícias: antes de desligar o WP antigo

`functions/_news-archive.ts` contém **somente IDs, slugs e datas** das 2.808 URLs reservadas; não contém corpos nem imagens. `npm run news:archive` atualiza esse inventário a partir do WP antigo; `-- --from-stdin` aceita a exportação validada. Não executar a atualização cegamente durante migração.

A variável opcional `NEWS_ARCHIVE_API_URL` permite apontar para o WP novo, usando a base REST completa que estiver habilitada nele (aceita `/wp-json/wp/v2` ou `/index.php?rest_route=/wp/v2`, usado pelo WP novo). O padrão atual permanece o legado. Quando configurada, a Function tenta a base nova primeiro e recorre ao legado em erro HTTP/rede/timeout. A configuração participa da chave de cache.

**Falta migrar e conferir conteúdo, mídia, IDs históricos e slugs.** A base alternativa exige os mesmos IDs e slugs do inventário. Se a importação alterar IDs, será necessário um mapa verificado antes de ativar a variável; IDs/slugs divergentes e listas incompletas disparam fallback, mas a validação editorial do corpo e das mídias continua indispensável. Confirmar também a exposição REST dos eventos expirados. Validar listagens, detalhes, sitemap e falha da origem nova no preview. Não desligar o legado enquanto houver dependência de conteúdo, mídia ou fallback. O snapshot não é backup do WP. Eventos relacionados no detalhe usam consulta limitada a 3 itens; nenhum catálogo completo é baixado nessa página.

## Deploy e operação

No Cloudflare Pages: comando `npm run build`, saída `dist`, Node 22; Functions são compiladas a partir de `functions/`. Cadastrar as variáveis de runtime separadamente para preview e produção. Conferir no painel se a integração Git e o branch de produção são os pretendidos; o repo não configura DNS, secrets nem proteção de branch.

Antes de promover: CI verde; verificar num preview HTML inicial/JSON-LD, CSP e headers; conferir `/`, notícia publicada, slug ausente (404/noindex), origem indisponível (503/Retry-After), `/publicacao/:slug` (301), `/instituicao/estatuto` (404) e listas noindex. O Vite preview sozinho não comprova esses comportamentos. Reverter pelo deploy anterior no Pages; não fazer redirects em massa sem mapa validado. Depois de atualização de domínio, regenerar os derivados e revisar Search Console e Bulk Redirects.

Logs estruturados de falhas estão nas Functions. Acompanhar em Pages/Cloudflare; o workflow `uptime.yml` verifica HTTP a cada 30 minutos quando habilitado no branch padrão do GitHub (a agenda não é SLA). `npm run test:uptime -- <preview>` permite uma verificação manual. As notificações de falha dependem das preferências da conta GitHub; alertas externos e Web Analytics dependem da conta e consentimento editorial. Os testes offline também conferem destinos internos literais; links externos e expressões dinâmicas exigem verificação no preview. Não há credenciais no repo. `security.txt` usa o contato real do setor de tecnologia em `config/contact.ts`; renovar o campo Expires anualmente e confirmar o fluxo interno de triagem.

## Conteúdo, segurança e pendências

- Estatuto: a busca pública de páginas do WP novo por “estatuto” retornou vazia em 26/10/2026. Rota exibe página não encontrada e responde 404/noindex, sem sitemap/menu. Publicar somente com documento oficial e conteúdo validado. `/instituicao` agora é um índice das páginas existentes.
- Rodapé: serviços remetem a Requerimentos, Tutoriais, Manual e Ouvidoria já implementados. Os rótulos de consultas sem destino específico foram substituídos; nenhum endereço de serviço foi inventado.
- Conteúdo institucional: validar gestão/diretoria, prazo da Ouvidoria e contato do encarregado com responsáveis. O índice `/acesso-a-informacao` reúne os canais e documentos existentes. Carta de serviços e novas seções de transparência ativa precisam de conteúdo aprovado; não gerar informações legais ou institucionais fictícias.
- Infraestrutura externa: proteção do wp-admin com Access/2FA, bloqueio de xmlrpc/users quando aplicável, backups, desempenho do WP, DNS, redirects históricos, Search Console, monitoramento e proteção de branch dependem da administração dessas plataformas.
- HSTS preload é somente uma recomendação para avaliação após inventário de todos os subdomínios; **não foi habilitado**. A CSP não foi enfraquecida.
- Produto: a busca inclui notícias (mínimo 3 caracteres), além de páginas e serviços; o feed RSS está em `/api/rss` e o calendário em `/api/events?format=ics`. Dados abertos adicionais dependem de definir conjuntos oficiais e licenças de publicação. Pré-renderização/SSR integral deve ser planejada com o ciclo de atualização do conteúdo.
- Acessibilidade: página de orientação disponível; há auditoria Lighthouse/axe de uma página estática no CI; falta auditoria humana e axe nos fluxos completos e definição institucional de VLibras/eMAG. Não declarar conformidade sem verificação. Lighthouse em produção/preview representativo continua necessário; orçamento de bundle não mede Core Web Vitals.
- Recomenda-se manter e revisar `.agents/`, `.cursor/`, `.claude/` e `skills-lock.json` como instruções e ferramentas de colaboração, sem segredos. São versionados e não foram removidos; não fazem parte do bundle público. Algumas instruções históricas podem descrever arquitetura antiga: prevalecem código e README atual.
