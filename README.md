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
- `/api/news`: notícias novas da categoria `noticias-do-portal` e acervo reservado; índice persistido em `NEWS_INDEX`, atualizado a cada 10 min; listas usam Cache API fresco por 60 s e SWR até 10 min. O detalhe (`?slug=`) usa a mesma chave do middleware (`post/<slug>`): Cache API fresco por 60 s e reserva no KV `NEWS_INDEX` (`news:cache:v1:post/<slug>`, até 7 dias) servida de imediato enquanto revalida em segundo plano. Erros não são guardados.
- `/api/events`, `/api/gallery`: proxy de rotas permitidas, cache de respostas bem-sucedidas por 60 s, timeout, parâmetros validados e 503 com Retry-After em falhas de integração. Detalhes consultam slug/ID, sem baixar o catálogo para resolver metadados.
- `/api/instagram` e `/api/cff-publicacoes`: agregadores existentes. Instagram conserva último resultado válido durante falhas curtas.
- `wordpress/`: plugin de galeria e instruções de instalação no WP; instalação/ativação é tarefa administrativa externa.
- `public/_headers`: CSP, HSTS sem preload e cache. O `_headers` não vale para respostas geradas pelas Functions (APIs, 404/410/503, sitemap de notícias, redirects); o middleware completa nelas apenas os headers ausentes com `SECURITY_HEADERS` (`functions/_middleware.ts`). Ao mudar o bloco `/*`, atualizar os dois: `npm run test:seo` falha se divergirem. Assets com hash têm immutable; fontes (30 dias), vídeos (7 dias) e imagens de `/images` (1 dia, mais 7 dias de `stale-while-revalidate`, revalidadas por ETag/304) usam cache finito porque seus nomes atuais não são versionados. Ao substituir esses arquivos sem mudar o nome, invalidar o cache ou aguardar o TTL.

A SPA continua montando o conteúdo no navegador. Metadados/JSON-LD e status vêm do servidor; isto não equivale a SSR integral. O domínio do WP continua permitido para imagens e vídeos; `connect-src` foi reduzido a self e Cloudflare Insights, pois o navegador não consulta mais REST diretamente.

## Configuração

Copie `.env.example` para `.env` para opções locais de frontend. Nenhum segredo deve usar prefixo `VITE_`.

| Configuração | Onde | Uso |
| --- | --- | --- |
| `SITE_URL` | `src/config/site.ts` | Canônico único; alterar somente com decisão institucional e redirects planejados |
| `WP_SITE_URL` | Pages Functions | Origem WP de eventos/galeria/metadados; padrão WP novo |
| `NEWS_ARCHIVE_API_URL` | Pages Functions | Não usada para notícias; a origem é o WordPress novo |
| `INSTAGRAM_FEED_URL` | Pages Functions | Origem do HTML do feed Instagram |
| `VITE_INSTAGRAM_FEED_URL` | build/dev | Feed usado pelo middleware Vite local |
| `VITE_INSTAGRAM_PROFILE_URL` | build | Perfil do botão de fallback |
| `VITE_WP_SITE_URL` | build | Base de URLs de uploads; não muda a origem REST das Functions |

As APIs locais de conteúdo usam a origem padrão; validar configurações runtime personalizadas em preview Pages. As origens configuradas devem ser administradas pela instituição, nunca recebidas de parâmetros do usuário. Mudanças de origem de mídia exigem revisão da CSP sem ampliar permissões indiscriminadamente.

### Arquivo de notícias: antes de desligar o WP antigo

`functions/_news-map.ts` reserva 2.808 identidades históricas e relaciona IDs antigos aos novos, preservando slugs, bloqueios editoriais e 11 títulos recuperados. Não contém corpos nem imagens. `functions/_news-archive.ts` deriva desse mapa as entradas não bloqueadas. `npm run news:archive` apenas valida o mapa contra o inventário público do WP novo, sem modificar arquivos; falha se uma identidade divergir ou uma notícia não bloqueada ainda estiver ausente, inclusive as entradas resolvidas por slug. Não aceita exportação por `--from-stdin`.

As notícias usam exclusivamente o WordPress novo. O mapa versionado preserva IDs e URLs históricos; falhas de origem retornam erro controlado e os resultados recentes permanecem em cache.

Os IDs históricos `107698`, `5967` e `8995` estão associados aos IDs `16768`, `16769` e `16770` no WP novo, com títulos e datas conferidos via REST. A validação editorial de corpos e mídias continua indispensável; o mapa não é backup do WP. Confirmar também a exposição REST dos eventos expirados e validar listagens, detalhes, sitemap e falha da origem nova no preview. Preservar o legado e as mídias enquanto houver dependências. Eventos relacionados no detalhe usam consulta limitada a 3 itens; nenhum catálogo completo é baixado nessa página.

## Deploy e operação

No Cloudflare Pages: comando `npm run build`, saída `dist`, Node 22; Functions são compiladas a partir de `functions/`. Preservar as variáveis de build e runtime separadamente para preview e produção. O projeto é `crf-al-org-br`, integrado ao repositório `crf-al.org.br`, com branch de produção `main`; o repo não configura DNS, secrets nem proteção de branch.

Antes de promover: CI verde; verificar num preview HTML inicial/JSON-LD, CSP e headers; conferir `/`, notícia publicada, slug ausente (404/noindex), origem indisponível (503/Retry-After), `/publicacao/:slug` (301), `/instituicao/estatuto` (404) e listas noindex. O Vite preview sozinho não comprova esses comportamentos. Reverter pelo deploy anterior no Pages; não fazer redirects em massa sem mapa validado. Depois de atualização de domínio, regenerar os derivados e revisar Search Console e Bulk Redirects.

Logs estruturados de falhas estão nas Functions. Acompanhar em Pages/Cloudflare; o workflow `uptime.yml` verifica HTTP a cada 30 minutos quando habilitado no branch padrão do GitHub (a agenda não é SLA). `npm run test:uptime -- <preview>` permite uma verificação manual. As notificações de falha dependem das preferências da conta GitHub; alertas externos e Web Analytics dependem da conta e consentimento editorial. Os testes offline também conferem destinos internos literais; links externos e expressões dinâmicas exigem verificação no preview. Não há credenciais no repo. `security.txt` usa o contato real do setor de tecnologia em `config/contact.ts`; renovar o campo Expires anualmente e confirmar o fluxo interno de triagem.

## Conteúdo, segurança e pendências

- Estatuto: a busca pública de páginas do WP novo por “estatuto” retornou vazia em 26/10/2026. Rota exibe página não encontrada e responde 404/noindex, sem sitemap/menu. Publicar somente com documento oficial e conteúdo validado. `/instituicao` agora é um índice das páginas existentes.
- Rodapé: serviços remetem a Requerimentos, Tutoriais, Manual e Ouvidoria já implementados. Os rótulos de consultas sem destino específico foram substituídos; nenhum endereço de serviço foi inventado.
- Conteúdo institucional: validar gestão/diretoria, prazo da Ouvidoria e contato do encarregado com responsáveis. O índice `/acesso-a-informacao` reúne os canais e documentos existentes. Carta de serviços e novas seções de transparência ativa precisam de conteúdo aprovado; não gerar informações legais ou institucionais fictícias.
- Infraestrutura externa: proteção do wp-admin com Access/2FA, bloqueio de xmlrpc/users quando aplicável, backups, desempenho do WP, DNS, redirects históricos, Search Console, monitoramento e proteção de branch dependem da administração dessas plataformas.
- Limite de taxa para `/api/news*` (**recomendado, não criado** por este repositório): as Functions já guardam "não encontrado" por 5 min, normalizam a busca (até 120 caracteres, 8 palavras, sem caracteres de controle) e a mantêm em cache por 5 min, mas termos novos ainda chegam ao WordPress. O operador pode criar em Security → WAF → Rate limiting rules uma regra como: expressão `(http.host eq "institucional.crf-al.org.br" and starts_with(http.request.uri.path, "/api/news"))`, característica IP, 60 requisições por 1 min (planos com período de 10 s: 15 por 10 s), ação *Managed Challenge* ou *Block* por 1 min. Opcionalmente, uma regra mais estrita só para `http.request.uri.query contains "search="` (ex.: 20 por minuto). Acompanhar primeiro em modo *Log* (quando disponível) e conferir que crawlers legítimos e o cron não sejam afetados (o cron acessa o WordPress diretamente, não `/api/news`).
- HSTS preload é somente uma recomendação para avaliação após inventário de todos os subdomínios; **não foi habilitado**. A CSP não foi enfraquecida.
- Produto: a busca inclui notícias (mínimo 3 caracteres), além de páginas e serviços; o feed RSS está em `/api/rss` e o calendário em `/api/events?format=ics`. Dados abertos adicionais dependem de definir conjuntos oficiais e licenças de publicação. Pré-renderização/SSR integral deve ser planejada com o ciclo de atualização do conteúdo.
- Acessibilidade: página de orientação disponível; há auditoria Lighthouse/axe de uma página estática no CI; falta auditoria humana e axe nos fluxos completos e definição institucional de VLibras/eMAG. Não declarar conformidade sem verificação. Lighthouse em produção/preview representativo continua necessário; orçamento de bundle não mede Core Web Vitals.
- Recomenda-se manter e revisar `.agents/`, `.cursor/`, `.claude/` e `skills-lock.json` como instruções e ferramentas de colaboração, sem segredos. São versionados e não foram removidos; não fazem parte do bundle público. Algumas instruções históricas podem descrever arquitetura antiga: prevalecem código e README atual.

### Índice de notícias em KV e atualização agendada

`newsIndex()` lê `news:index:v1` no binding `NEWS_INDEX` com `cacheTtl: 60` e mantém uma cópia decodificada por isolate durante 60 s (o índice tem ~1 MB; evita `JSON.parse` a cada lista, RSS e sitemap). Um índice novo aparece em até ~2 min, além da propagação eventual do KV. O valor contém `storedAt` e `value`, sem TTL: um índice antigo continua disponível mesmo durante indisponibilidade do WordPress. Após 10 min, a leitura agenda refresh em `ctx.waitUntil`. Um namespace vazio faz a primeira construção em primeiro plano; enquanto outro refresh segura o lease, retorna 503/Retry-After até o índice existir. Sem binding, permanece o fallback de construção ao vivo + Cache API (60 s fresco, SWR até 600 s). Falha de KV configurado retorna erro, evitando despejar tráfego no host por indisponibilidade do armazenamento.

A construção usa um pool de quatro requisições, com uma repetição para HTTP 5xx ou timeout de 15 s. Requisições de usuários têm prazo total: páginas HTML (SSR de metadados) 4,5 s sem repetição; `/api/news` e `/api/rss` 8 s, repetindo uma vez só se ainda houver prazo; `/api/events` e `/api/gallery` 8 s. Com cache, inclusive antigo, a resposta não espera a origem e a revalidação em segundo plano não herda o prazo. No navegador, o React Query não repete respostas 4xx nem 503. Deduplica IDs, aceita totais variáveis e páginas removidas e acompanha páginas novas. Há um teto de segurança de 200 páginas (~20 mil posts, ordenados por data decrescente): acima dele o índice guarda as mais recentes e registra `news_index_truncated` em vez de falhar. Não é um snapshot transacional do WordPress: alterações durante paginação podem ficar para o próximo refresh. Falhas reais não substituem o último índice válido. Listagens e detalhes usam `_fields`, uma consulta de mídia por conjunto de IDs e categorias paginadas em cache; recompõem `_embedded` para manter capas, srcset, alt e categorias dos consumidores. No detalhe, post e categorias são buscados em paralelo e, em seguida, mídia e autor também em paralelo (duas idas à origem no pior caso, sem `_embed`); o autor fica em cache. Edições no WordPress aparecem após a primeira revalidação passados 60 s (cache local por data center). O KV só é regravado quando o conteúdo muda ou a reserva passa de 24 h, para economizar escritas.

O Worker em `workers/news-index-cron/` executa `*/10 * * * *` (UTC), grava diretamente no mesmo KV e, depois do índice, pré-aquece o detalhe das 30 notícias mais recentes com uma única consulta `include` (mais uma de mídia), reutilizando a implementação e o mapa histórico das Functions. Escolhemos escrita direta para não expor endpoint de refresh nem distribuir `NEWS_REFRESH_TOKEN`, e para o cron não depender de uma requisição HTTP ao Pages. Publique ambos quando mudar o mapa ou a lógica do índice. O Worker não tem rota HTTP pública.

Há single-flight por isolate e um lease/timestamp de 120 s em `news:index:refresh:v1`, mantido até expirar após sucesso. Após falha, o lease é encurtado para 15 s, para que um KV vazio não responda 503 por 2 min sem martelar a origem. Isso reduz rajadas e dá intervalo para propagação. **KV tem consistência eventual e não oferece lock atômico**: isolates/regiões ainda podem iniciar coletas simultâneas; quatro conexões é limite por coleta, não global. Exclusão global estrita exigiria Durable Object. O cron é a fonte regular de refresh; `waitUntil` de requisições tem janela limitada após a resposta, portanto a atualização agendada também cobre coletas lentas que ultrapassem essa janela. Monitorar falhas do cron e idade de `storedAt`.

Decisão de configuração: **remover o `wrangler.toml` da raiz e manter o Pages configurado pela API/painel**. Adotar esse arquivo como fonte de configuração tornaria os campos correspondentes não editáveis no painel e exigiria reproduzir toda a configuração existente. As variáveis `VITE_*` são de build, portanto declarar somente variáveis de runtime e KV não preservaria a configuração do build. A opção mais segura é o operador acrescentar apenas o binding, preservando as configurações existentes. O arquivo `workers/news-index-cron/wrangler.toml` configura exclusivamente o Worker separado.

Configuração operacional (a executar pelo operador; nenhuma ação Cloudflare foi executada nesta alteração):

1. Usar o projeto Pages existente `crf-al-org-br` (`crf-al-org-br.pages.dev`, domínio `institucional.crf-al.org.br`), branch de produção `main`. Preservar `compatibility_date = 2026-09-21`, flags vazias, `fail_open = true` e `usage_model = standard`. Manter as quatro variáveis `plain_text`, idênticas em produção e preview:

   | Variável | Valor |
   | --- | --- |
   | `INSTAGRAM_FEED_URL` | `https://wordpress.crf-al.org.br/index.php?rest_route=/wp/v2/pages&slug=instagram&_fields=content` |
   | `VITE_SITE_URL` | `https://institucional.crf-al.org.br` |
   | `VITE_WP_NEWS_SITE_URL` | `https://www.crf-al.org.br` |
   | `VITE_WP_SITE_URL` | `https://wordpress.crf-al.org.br` |

   Preservar inclusive as variáveis existentes que não são consumidas atualmente; `VITE_SITE_URL` não substitui o canônico versionado em `src/config/site.ts`.

2. Os namespaces já foram criados; não recriá-los. O operador deve adicionar o binding `NEWS_INDEX` pela API do Pages, em `deployment_configs.production.kv_namespaces` e `deployment_configs.preview.kv_namespaces`, respectivamente, preservando os demais campos do projeto:

   | Ambiente | Namespace | ID |
   | --- | --- | --- |
   | Produção | `crf-al-news-index` | `196cd57ec1974cafb40efbb388cb0924` |
   | Preview | `crf-al-news-index-preview` | `1a1735967b6b42f68abc124256588c32` |

   Cada entrada `NEWS_INDEX` deve ter `namespace_id` igual ao ID do respectivo ambiente. Alternativamente, configurar em Workers & Pages → `crf-al-org-br` → Settings → Bindings → KV namespace, separadamente por ambiente. Não há outros bindings no levantamento atual; preservar quaisquer bindings acrescentados posteriormente.

3. Após configurar os bindings, publicar novos deployments pela integração Git existente: `main` usa produção e `feat/noticias-arquivo-wp-novo` usa preview. O push desta branch pode disparar o preview; se o binding for configurado depois, gerar outro deployment para aplicá-lo. Conferir os bindings e as variáveis em ambos os ambientes.
4. Publicar o cron separadamente, pelo operador em ambiente autenticado, a partir da raiz do repositório:

   ```sh
   npx wrangler deploy --config workers/news-index-cron/wrangler.toml
   ```

   Esse comando é apenas documentação; não executar login/deploy neste ambiente. O Worker se chama `crf-al-news-index-cron`; `main = "index.ts"` resolve para `workers/news-index-cron/index.ts`, cujo handler `scheduled` executa a agenda `*/10 * * * *` (a cada 10 minutos, UTC). Seu único binding aponta para o KV de produção, sem `preview_id`. Não agendar esse Worker contra preview. O primeiro cron ou acesso preenche o namespace; conferir `storedAt` e logs após ativação. O preview faz refresh por acesso; para desenvolvimento sem KV, usar `npm run dev`.

Referências oficiais consultadas: [bindings de Pages](https://developers.cloudflare.com/pages/functions/bindings/), [configuração Wrangler de Pages](https://developers.cloudflare.com/pages/functions/wrangler-configuration/), [consistência do KV](https://developers.cloudflare.com/kv/concepts/how-kv-works/), [comandos KV](https://developers.cloudflare.com/kv/reference/kv-commands/) e [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).
