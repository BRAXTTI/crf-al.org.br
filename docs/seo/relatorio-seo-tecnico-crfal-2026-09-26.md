# Relatório de SEO Técnico — CRF-AL (Conselho Regional de Farmácia de Alagoas)
Data da análise: 2026-09-26
Propriedades: `crf-al.org.br` (apex) · `institucional.crf-al.org.br` (novo SPA) · `www.crf-al.org.br` (WordPress antigo) · `wordpress.crf-al.org.br` (WordPress novo/headless)

## 1. Resumo dos Dados Analisados

**Recebido**
- URL de produção `crf-al.org.br` e links de análise do PageSpeed Insights (mobile e desktop).
- Acesso à árvore de código do projeto (repositório local): Vite + React 19 SPA, `react-router-dom`, `react-helmet-async` (CSR puro), deploy em Cloudflare Pages, `scripts/generate-sitemaps.mjs`, `public/robots.txt`, `dist/_headers`, `index.html`, `src/components/SEO.tsx`, `src/config/site.ts`, `src/router/app-router.tsx`.
- **Export do Google Search Console (propriedade de domínio, última 3 meses)**: `crf-al.org.br-Performance-on-Search-2026-09-21/` (Páginas — 999 linhas; Consultas — 1.001 linhas; Países; Dispositivos; Gráfico; Aspecto da pesquisa).
- **Export do GSC filtrado (últimos 28 dias, uma página)**: `crf-al.org.br-Performance-on-Search-2026-09-26/`.
- **Export de Indexação/Cobertura do GSC**: `crf-al.org.br-Coverage-2026-09-26/` (Indexados vs Não indexadas + Problemas críticos/não críticos).
- **Mapa de redirecionamento da migração** (`migration/`): `redirects-posts.csv` (2.807 posts), `redirects-pages.csv` (63), `redirects-priority.csv`, `redirects-sections.csv`, `batch1-home-pages-sections.csv`.

**Coletado em produção (2026-09-26)**
- `robots.txt` e sitemaps de `institucional`, `www` e `crf-al.org.br`.
- Comportamento HTTP de rotas SPA (home, rota profunda de notícia, rota inexistente), assets e status codes.
- DOM renderizado (título, canonical, robots, JSON-LD, H1) via navegador headless.
- Migração de URLs: cobertura de redirecionamento das páginas do WP antigo (63/63) e amostra de posts (20/20) + sitemaps originais.
- Backend WordPress: REST `wp-json/wp/v2`, TTFB, headers de mídia.
- PageSpeed Insights mobile e desktop (Laboratório Lighthouse 13.5.0).

**Lacunas de dados (não fornecidas / necessárias)**
- **Relatório de Indexação/Cobertura do GSC por host** (não é o mesmo que o Performance). O export de Desempenho mostra *impressões*, não *URLs indexadas*. Necessário para saber quantas URLs de `institucional` estão no índice vs `www`, e o motivo dos erros de cobertura.
- **Logs de servidor/CDN com User-Agent** (Cloudflare Logpush). Informado que existem, mas nenhum arquivo foi disponibilizado no projeto. Sem eles não há *log file analysis* (frequência de crawl do Googlebot, soft 404s recorrentes, desperdício de crawl budget, status por host).
- **GA4 / Analytics.** Não fornecido (opcional; não bloqueia o diagnóstico técnico — ver nota sobre GA4 ao final).
- **Configuração das regras de redirect** (onde está publicada a tabela de 301). O mapa existe em `migration/`, mas não está versionado como código de deploy.
- **Listas de URL por motivo de cobertura** (drill-down de "5xx", "404", "noindex", "redirecionamento"). O export traz apenas as contagens agregadas; para agir com precisão é preciso a relação de URLs de cada motivo.

**Contradições sinalizadas antes de recomendar**
1. `robots.txt` do apex `crf-al.org.br` responde **301 → `www.crf-al.org.br/robots.txt`** (WordPress antigo) e aponta `Sitemap: https://www.crf-al.org.br/wp-sitemap.xml` (sitemap antigo). Já o canonical do novo site é `https://institucional.crf-al.org.br/`, cujo `robots.txt` aponta para o sitemap novo. São **duas políticas de indexação divergentes** entre hosts.
2. O sitemap novo publica notícias como `/imprensa/noticias/{id}` (IDs), enquanto o WP antigo mantém a mesma notícia em `www.crf-al.org.br/{slug}/` com **canonical autorreferente**. Duas URLs indexáveis para o mesmo conteúdo.
3. **O mapa de 301 de posts existe (`migration/redirects-posts.csv`, 2.807 entradas), mas não está aplicado em produção**: no teste ao vivo, as páginas antigas redirecionam (63/63 → 301), mas **os posts não** (amostra de 5 posts de alto tráfego → todos HTTP 200, sem redirect).
4. **Terceiro host indexável**: `wordpress.crf-al.org.br` (destinado a backend headless) está com `robots.txt` liberando tudo (`User-agent: * / Disallow:`) e páginas com canonical próprio — e **aparece no GSC com cliques/impressões** (9 URLs no Top 1000).

---

## 2. Problemas Identificados

### Categoria: Causa-raiz da não indexação do site novo (crítico — corrigido no código)

**Dados de Cobertura (propriedade de domínio, todas as páginas conhecidas, snapshot 2026-09-20):**
- **Indexados: 2.572 · Não indexadas: 2.586** (~5.158 URLs conhecidas; ~50% fora do índice).
- Problemas críticos: "Rastreada, mas não indexada no momento" **1.467**; "Detectada, mas não indexada no momento" **831**; "Página com redirecionamento" 85; **"Erro no servidor (5xx)" 73**; "Não encontrado (404)" 62; "Excluída pela tag noindex" 26; "Página alternativa com tag canônica adequada" 23; **"Cópia sem página canônica selecionada pelo usuário" 16**; "Bloqueada pelo robots.txt" 1; "Cópia, o Google e o usuário selecionaram uma página canônica diferente" 2.
- Limitação: o export é **agregado por domínio** (não separa host). Para atribuir por host é preciso o drill-down de cada motivo (lista de URLs).

- **Problema: canonical estático da home coexistindo com o canonical por página do Helmet.**
  - `index.html` injetava `<link rel="canonical" href="https://institucional.crf-al.org.br/">`; o `react-helmet-async` injeta um segundo canonical por página. Inspeção do `<head>` renderizado de `/imprensa/noticias/8155`:
    `headCanonicals = ["https://institucional.crf-al.org.br/", "https://institucional.crf-al.org.br/imprensa/noticias/8155"]` — **o canonical da home vem primeiro**.
  - Efeito: o Google recebe, para cada página do site novo, um sinal canônico apontando para a **home**. Páginas vistas como cópia/duplicata não são indexadas como únicas — o que bate exatamente com os buckets "Detectada, mas não indexada" + "Rastreada, mas não indexada" e "Cópia sem página canônica selecionada pelo usuário". É a explicação mais provável para `institucional` ter **0 cliques / 0 impressões** no GSC.
  - Além disso, o `<head>` continha **dois `<title>`** e **duas `meta description`** (estático + Helmet) e a página `/404` acumulava `robots: [index, follow, noindex, nofollow]` (estático + Helmet).
  - **Impacto**: Alto.
  - **Correção aplicada (invisível, já no código)**: removidos `canonical`, `robots` e `meta description` do `index.html`; mantido apenas o `<title>` como fallback pré-render. Agora o canonical/robots/description são definidos exclusivamente por página (Helmet). Build revalidado (`npm run build` OK). **Requer deploy** para valer em produção.
  - **Fonte**: Google Search Central — *JavaScript SEO basics* ("make sure that this is the only rel=canonical link tag on the page… Conflicting or multiple rel=canonical link tags may lead to unexpected results") e *How to specify a canonical URL…* ("If you can't set the canonical URL in the HTML source code, leave it out and only set it with JavaScript").
  - **Requer aprovação visual**: Não.

- **Problema: soft 404 persiste (não corrigível só com canonical).**
  - Rotas inexistentes continuam retornando HTTP 200 com o shell. Adicionar um `404.html` estático no Cloudflare Pages faria as rotas profundas não prerenderizadas caírem nele (quebrando o *deep link*), então a correção correta depende do **prerender/SSR**.
  - **Impacto**: Médio (até o prerender).
  - **Recomendação**: resolver junto com o prerender (rota conhecida → 200 com conteúdo; desconhecida → 404).
  - **Fonte**: Google Search Central — *JavaScript SEO basics* (soft 404 em SPA) / Google Crawling — *HTTP status codes*.
  - **Requer aprovação visual**: Não.

- **Problema: 5xx (73) e 404 (62) sem lista de URLs.**
  - A amostra ao vivo de 71 posts antigos hoje retornou **100% HTTP 200** (sem 5xx), indicando erros intermitentes ou em outro conjunto de URLs. Sem a lista de URLs (drill-down do GSC) não há como corrigir com precisão.
  - **Impacto**: Médio (a confirmar).
  - **Recomendação**: no GSC, abrir cada motivo e exportar a lista de URLs (5xx, 404, noindex, redirecionamento).
  - **Fonte**: Google Search Central — *Troubleshoot crawl errors*.
  - **Requer aprovação visual**: Não.

### Categoria: Visibilidade Orgânica e Migração — evidência do GSC (crítico)

**Fotografia do GSC (propriedade de domínio, últimos 3 meses, busca web, 2026-06-20 a 2026-09-19):**
- Totais: **9.198 cliques / 721.575 impressões** (Dispositivos) — Celular 5.857 cliques / 554.465 impr. (CTR 1,06%, pos. 7,01); Computador 3.264 / 163.189 (CTR 2%, pos. 7,75); Tablet 77 / 3.921.
- Distribuição por host (Top 1000 páginas): **`www.crf-al.org.br` = 9.476 cliques / 770.478 impressões**; apex `crf-al.org.br` = 29 / 263; `wordpress.crf-al.org.br` = 6 / 149; **`institucional.crf-al.org.br` = 0 cliques / 0 impressões** (não aparece em nenhuma das 1.000 páginas nem das 1.000 consultas).
- Consultas: **marca ~3.987 cliques / 21.218 impressões** (ex.: "crf al" 1.466 cliques, CTR 73,89%; "crf em casa al" 719, CTR 41,51%); **não-marca ~599 cliques / 230.163 impressões** (CTR ~0,26%), com picos como "medicamento" (54.080 impr., 0 cliques, pos. 9,43), "glicemia capilar" (27.684 impr., 61 cliques, pos. 4,21), "ivermectina" (23.993 impr., 17 cliques, pos. 4,33).

- **Problema: o site novo é invisível na busca; 100% da visibilidade orgânica está no WordPress antigo.**
  - **Impacto**: Alto (risco existencial na migração).
  - **Recomendação**: tratar a indexação de `institucional` como prioridade nº1 (sitemap submetido, inspeção de URL, log de rastreio). Não desativar o `www` até que o novo host esteja indexado e ranqueando. Antes de publicar a tabela de 301 dos posts, garantir que os destinos (`/imprensa/noticias/{id}`) renderizem conteúdo no HTML e tenham canonical único — um 301 é sinal forte, mas o destino precisa ser indexável.
  - **Fonte**: Google Search Central — *Move a site with URL changes*; *JavaScript SEO basics* (o destino do redirect é processado no lugar da origem).
  - **Requer aprovação visual**: Não.

- **Problema: página individual com queda recente de cliques/posição.**
  - O post `/teste_da_glicemia_capilar...` (maior ativo não-marca, alvo do mapa para `/imprensa/noticias/8155`) caiu de ~4–9 cliques/dia para 0–3/dia entre 15 e 22/09, com posição derivando de ~4,2 para ~5,6 (export de 28 dias).
  - **Impacto**: Alto (é a página de maior impressão do site).
  - **Recomendação**: monitorar no GSC pós-migração; revisar título/descrição e conteúdo; garantir que o destino no novo host seja equivalente e indexável antes do 301.
  - **Fonte**: Google Search Central — *Debug drops in Search traffic*: https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops
  - **Requer aprovação visual**: Não.

- **Problema: CTR muito baixo em páginas de alto volume de impressões.**
  - Exemplos (pos. 3–6, CTR &lt; 1%): glicemia capilar (77.763 impr., 0,25%), ivermectina/nitazoxanida (27.443 impr., 0,08%), alho e coração (35.237 impr., 0,47%), aloe vera (23.723 impr., 0,7%).
  - **Impacto**: Médio (oportunidade de ganho sem novo conteúdo).
  - **Recomendação**: reescrever `<title>` e meta description com intenção informacional/saúde (o CTR baixo sugere snippet genérico). Enquanto o WP antigo permanece, aplicar lá; no destino novo, modelar os melhores títulos.
  - **Fonte**: Google Search Central — *Title links* / *Snippets*: https://developers.google.com/search/docs/appearance/snippet
  - **Requer aprovação visual**: Não.

### Categoria: Renderização e Indexação (crítico)

- **Problema: o site é um SPA *client-side rendered* sem SSR/prerender — o HTML inicial é um *app shell* vazio.**
  - Todas as URLs (home, rotas profundas, inexistentes) devolvem exatamente os mesmos **3.122 bytes** com `<div id="root"></div>` sem conteúdo. Confirmado também com User-Agent de Googlebot (sem cloaking, mesmo shell).
  - **Impacto**: Alto.
  - **Recomendação**: pré-renderizar/SSR. Opções: (a) prerender das rotas estáticas no *build* e SSR/edge-render das rotas dinâmicas via Cloudflare Pages Functions (`HTMLRewriter`) consumindo o WP; (b) migrar para um framework com SSR. Manter o *fallback* CSR apenas como *progressive enhancement*. O Google renderiza JS, mas *server-side ou pre-rendering ainda é recomendado* por tornar o site mais rápido para usuários e crawlers.
  - **Fonte**: Google Search Central — *Understand the JavaScript SEO basics* (seção "How Google processes JavaScript", modelo *app shell*): https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics
  - **Requer aprovação visual**: Não (infra/renderização).

- **Problema: canonical duplicado e conflitante em todas as páginas.**
  - `index.html` injeta estaticamente `<link rel="canonical" href="https://institucional.crf-al.org.br/">` e o `react-helmet-async` injeta um segundo canonical por página **sem remover o estático**. Medido no DOM renderizado de `/imprensa/noticias/16193`: `["https://institucional.crf-al.org.br/", "https://institucional.crf-al.org.br/imprensa/noticias/16193"]` — o canonical da **home aparece primeiro**.
  - **Impacto**: Alto.
  - **Recomendação**: remover o `<link rel="canonical">` estático do `index.html` e deixar **apenas um** canonical por página (Helmet ou, preferencialmente, HTML do servidor). Garantir canonical autorreferente correto.
  - **Fonte**: Google Search Central — *How to specify a canonical URL…* ("Don't specify different URLs as canonical for the same page using different canonicalization techniques") e *JavaScript SEO basics* ("make sure that this is the only rel=canonical link tag on the page… Conflicting or multiple rel=canonical link tags may lead to unexpected results").
  - **Requer aprovação visual**: Não.

- **Problema: *soft 404* generalizado — o SPA *fallback* responde HTTP 200 para qualquer caminho inexistente, inclusive assets.**
  - `/isto-nao-existe-xyz-123` → **200** com o shell; `/assets/naoexiste.js` → **200** `text/html`; `/llms.txt` → **200** `text/html` (por isso o Lighthouse acusa "llms.txt não segue recomendações" e "ai-catalog.json schema inválido" — são falsos positivos do catch-all).
  - **Impacto**: Alto.
  - **Recomendação**: implementar `404.html` real com status 404 no Cloudflare Pages (e `_redirects` para rotas conhecidas); aplicar `noindex` somente na página de erro. A página `/404` já usa `noindex` via Helmet — falta o **status HTTP** correto.
  - **Fonte**: Google Search Central — *JavaScript SEO basics* ("Avoid soft 404 errors in single-page apps") e Google Crawling Infrastructure — *How HTTP status codes affect Google's crawlers* (2xx + conteúdo de erro = soft 404): https://developers.google.com/crawling/docs/troubleshooting/http-status-codes
  - **Requer aprovação visual**: Não.

- **Problema: meta robots conflitante na página de erro.**
  - Na `/404` renderizada coexistem `["index, follow"]` (estático do `index.html`) e `["noindex, nofollow"]` (Helmet). Sinais contraditórios.
  - **Impacto**: Médio.
  - **Recomendação**: remover `robots` do `index.html` estático (deixar o controle exclusivamente por página) para eliminar duplicidade/conflito.
  - **Fonte**: Google Search Central — *Robots meta tag and X-Robots-Tag* (evitar sinais conflitantes): https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag
  - **Requer aprovação visual**: Não.

- **Problema: duplicação de `<title>` e `<meta name="description">`.**
  - No DOM renderizado existem **dois** `<title>` e **duas** `meta[name=description]` (o estático do `index.html` + o do Helmet).
  - **Impacto**: Médio.
  - **Recomendação**: mesma correção acima (retirar tags SEO base do `index.html` estático) ou garantir que o Helmet substitua as tags-base.
  - **Fonte**: Google Search Central — *Title links* / *Snippets*: https://developers.google.com/search/docs/appearance/title-link
  - **Requer aprovação visual**: Não.

### Categoria: Migração de URLs e Conteúdo Duplicado (crítico)

- **Problema: notícias antigas permanecem publicadas e indexáveis no WP antigo, sem 301 para o novo site.**
  - Todas as **2.807 notícias** (x-wp-total) continuam em `https://www.crf-al.org.br/{slug}/` com **HTTP 200** e **canonical autorreferente** (amostra 20/20 sem redirecionamento), e seguem listadas em `www/wp-sitemap-posts-post-1.xml`. O novo site publica as mesmas notícias em `institucional.crf-al.org.br/imprensa/noticias/{id}` e as lista em `sitemap-news.xml` (2.807 URLs).
  - As **páginas** do WP antigo têm redirecionamento correto (63/63 → 301 para o novo site), mas **os posts não** — a cobertura de 301 cobre páginas e não o acervo de notícias. O mapa de posts **já está preparado** em `migration/redirects-posts.csv` (2.807 entradas, ex.: glicemia → `/imprensa/noticias/8155`), porém **não publicado**. Há também `migration/redirects-priority.csv` priorizando as URLs com tráfego.
  - **Impacto**: Alto (duplicação entre hosts + perda de histórico de backlinks/autoria e de sinais).
  - **Recomendação**: publicar a tabela de 301 de `redirects-priority.csv`/`redirects-posts.csv` **somente após** os destinos estarem renderizando e indexáveis (ver categoria de Visibilidade Orgânica). Ordem segura: (1) corrigir renderização/canonical/404; (2) submeter sitemap e confirmar indexação de `institucional`; (3) publicar 301 em lote, começando pela lista de prioridade; (4) monitorar no GSC. Enquanto isso, manter os posts antigos no ar (é o que sustenta o tráfego).
  - **Fonte**: Google Search Central — *Move a site with URL changes*: https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes · *Redirects and Google Search*: https://developers.google.com/search/docs/crawling-indexing/301-redirects
  - **Requer aprovação visual**: Não.

- **Problema: conteúdo rascunho/teste indexável no acervo do WP antigo (e replicado no novo sitemap).**
  - Exemplos vivos com 200: `ola-mundo`, `lorem-ipsum-...`, `this-is-your-first-post`, `welcome-to-wordpress`, `2074-2`, `teste-definitivo`, `best-dating-sites`. O `sitemap-news.xml` novo lista todas as 2.807 publicações, incluindo esses itens.
  - **Impacto**: Médio.
  - **Recomendação**: excluir/despublicar rascunhos de teste na origem (WP) e filtrar o gerador de sitemap (`scripts/generate-sitemaps.mjs`) por categoria/status/`slug` para não publicar conteúdo thin/irrelevante.
  - **Fonte**: Google Search Central — *Spam policies* (conteúdo thin/auto-gerado) e *Build and submit a sitemap* (incluir apenas URLs canônicas relevantes): https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
  - **Requer aprovação visual**: Não.

### Categoria: robots.txt e Sitemaps (alto/médio)

- **Problema: sitemap do WordPress antigo submetido no GSC (via apex).**
  - No GSC há **dois índices de sitemap**: `https://institucional.crf-al.org.br/sitemap.xml` (2.827 páginas — o correto) e `https://crf-al.org.br/sitemap.xml` (**302 → `https://www.crf-al.org.br/wp-sitemap.xml`**, 3.094 páginas — o WordPress antigo). O segundo inclui tipos que não deveriam ser indexados (`neve_custom_layouts`, `ae_global_templates`, `elementor_library`, `wpdmpro`, `mailpoet_page`, taxonomias e `users`).
  - **Impacto**: Alto (mantém descoberta/indexação ativa das URLs antigas duplicadas e de páginas de template/usuário, na direção oposta à migração).
  - **Recomendação**: **remover `https://crf-al.org.br/sitemap.xml` do GSC** e manter **apenas** `https://institucional.crf-al.org.br/sitemap.xml`. Não submeter `wp-sitemap.xml` do `www` separadamente. Corrigir também o `robots.txt` do apex (que aponta para o sitemap antigo).
  - **Fonte**: Google Search Central — *Build and submit a sitemap* / *Manage sitemaps with sitemap index file*: https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps
  - **Requer aprovação visual**: Não.

- **Problema: `robots.txt` do apex aponta para o domínio e sitemap antigos.**
  - `https://crf-al.org.br/robots.txt` → **301 → `https://www.crf-al.org.br/robots.txt`**, que contém `Sitemap: https://www.crf-al.org.br/wp-sitemap.xml` (WordPress antigo). O `robots.txt` correto (`institucional`) existe, mas só no subdomínio.
  - Regras de robots.txt valem **apenas para o host/protocolo/porta onde o arquivo é servido**; redirecionar o arquivo entre hosts não é o padrão pretendido.
  - **Impacto**: Médio.
  - **Recomendação**: servir `robots.txt` diretamente em cada host raiz (sem 301 cross-host). No apex, apontar `Sitemap:` para `https://institucional.crf-al.org.br/sitemap.xml`, ou manter o apex apenas como 301 e tratá-lo separadamente no GSC.
  - **Fonte**: Google — *How Google interprets the robots.txt specification* (3xx/escopo por host): https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec
  - **Requer aprovação visual**: Não.

- **Problema: sitemap de páginas incompleto e `lastmod` estático.**
  - `sitemap-pages.xml` não inclui `eventos/{slug}`, `publicacao/{slug}` nem variantes; o `lastmod` de todas as páginas é fixo `2026-06-17`.
  - **Impacto**: Médio.
  - **Recomendação**: incluir páginas de eventos e publicações (dinâmicas) e gerar `lastmod` a partir da data real de modificação. Publicar também um *news sitemap* válido (namespace `news`) se o objetivo for Google News/Discover.
  - **Fonte**: Google Search Central — *Build and submit a sitemap* (lastmod confiável) e *News sitemaps*: https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap
  - **Requer aprovação visual**: Não.

- **Problema: `wordpress.crf-al.org.br` (backend headless) está indexável e ranqueando.**
  - `robots.txt` libera tudo (`User-agent: * / Disallow:`) com sitemap em `http://` (não https); páginas com canonical próprio e título "… - Wordpress"; o host aparece no GSC com cliques/impressões (9 URLs no Top 1000).
  - **Impacto**: Médio.
  - **Recomendação**: se é backend, aplicar `noindex`/`X-Robots-Tag: noindex` e restringir via Access/robots; corrigir o sitemap para `https://`. Consolidar conteúdo em um único host.
  - **Fonte**: Google Search Central — *noindex*: https://developers.google.com/search/docs/crawling-indexing/block-indexing
  - **Requer aprovação visual**: Não.

### Categoria: Performance / Core Web Vitals (alto)

- **Problema: LCP mobile no limite ruim em laboratório (sem dados de campo).**
  - PSI mobile: Perf **72**, FCP **2,4 s**, LCP **5,2 s**, TBT 20 ms, CLS 0,007, SI **6,3 s**. Desktop: Perf 94, LCP 0,9 s. **Não há dados de campo do CrUX ("No Data")** — provavelmente tráfego/visibilidade insuficientes para o conjunto de dados público.
  - **Impacto**: Alto em mobile.
  - **Recomendação**: (1) priorizar LCP (pré-carregamento do elemento LCP, servir o hero em formato moderno e dimensão correta); (2) resolver as *insights*: "Improve image delivery" (economia estimada 1.293 KiB mobile / 1.810 KiB desktop), "Render-blocking requests" (~300 ms mobile), "Reduce unused JavaScript" (100 KiB), "Use efficient cache lifetimes" (37/79 KiB).
  - **Fonte**: Google Search Central — *Core Web Vitals*: https://developers.google.com/search/docs/appearance/core-web-vitals · web.dev — *LCP* (bom ≤ 2,5 s; ruim > 4,0 s): https://web.dev/articles/lcp
  - **Requer aprovação visual**: Não (otimização), exceto o item de imagens abaixo.

- **Problema: imagens pesadas e sem dimensão explícita.**
  - `fluxograma-primeira-inscricao-crfal.png` = **1,5 MB**; `bannerzero.jpg` 114 KB; retratos `.png` de 73–82 KB cada. Lighthouse: "Image elements do not have explicit width and height" (risco de CLS) e "Avoid non-composited animations (2)". O bundle JS é **689 KB** e o CSS 76 KB.
  - **Impacto**: Alto.
  - **Recomendação**: converter PNG/JPG para WebP/AVIF, gerar `srcset` responsivo, definir `width`/`height` (ou `aspect-ratio`) e `loading="lazy"` fora da dobra. Imagens de notícia vêm do WP antigo em `/app/uploads/` (já com cache `max-age=315360000` e CF HIT — ok), mas há um JPEG de 319 KB.
  - **Fonte**: Google Search Central — *Lazy-loading best practices*: https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading
  - **Requer aprovação visual**: **Sim** (troca de formato/atributos pode afetar layout — validar com o time de design).

- **Problema: dependência de API lenta para renderizar notícias.**
  - O detalhe de notícia só tem conteúdo após buscar `www.crf-al.org.br/wp-json/wp/v2`. TTFB medido da REST API: **~2,0–2,2 s**; a própria página HTML do WP antigo: **~5,2 s**. Isso empurra o LCP das notícias (páginas mais numerosas) para cima.
  - **Impacto**: Alto.
  - **Recomendação**: cachear a REST API na borda (Cloudflare Cache API / "cache everything") e/ou materializar o acervo de notícias em R2/KV no momento da migração; SSR/prerender com dados já disponíveis no HTML.
  - **Fonte**: Google Search Central — *Understand the JavaScript SEO basics* (content fetched by JS). Complemento sem confirmação oficial: cache de borda é prática de mercado para APIs de CMS headless.
  - **Requer aprovação visual**: Não.

### Categoria: Metadados e Dados Estruturados (médio/baixo)

- **Problema: página de publicação sem metadados próprios.**
  - `src/features/publications/pages/PublicationDetailPage.tsx` não usa `<SEO>` — herda título/canonical/description estáticos da home.
  - **Impacto**: Médio.
  - **Recomendação**: adicionar `<SEO>` com título, description e canonical por publicação.
  - **Fonte**: Google Search Central — *Title links* / *Snippets*.
  - **Requer aprovação visual**: Não.

- **Problema: dados estruturados podem ser enriquecidos.**
  - Presentes: `GovernmentOrganization` (index.html, `sameAs: []` vazio) e `NewsArticle` (páginas de notícia — correto, com `author`/`publisher`). Ausentes: `BreadcrumbList` nas notícias, `Event` para eventos e `ContactPoint.telephone`.
  - **Impacto**: Baixo/Médio.
  - **Recomendação**: preencher `sameAs` (Instagram/YouTube/Facebook/X), telefone; adicionar `BreadcrumbList` e `Event`. Validar no Rich Results Test. Verificar se o `logo` do publisher atende às diretrizes (imagem raster quadrada, ideal ≥ 112×112 px).
  - **Fonte**: Google Search Central — *Article structured data*: https://developers.google.com/search/docs/appearance/structured-data/article · *Organization*: https://developers.google.com/search/docs/appearance/structured-data/organization · *Breadcrumb*: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb
  - **Requer aprovação visual**: Não.

- **Problema: título/description-base genéricos como fallback.**
  - Enquanto o JS não roda, todas as rotas expõem título `CRFAL - Conselho Regional…` e description institucional. Sem impacto direto no índice do Google (que renderiza), mas relevante para *preview* social e para crawlers que não executam JS.
  - **Impacto**: Baixo.
  - **Recomendação**: coberto pela solução de SSR/prerender.
  - **Fonte**: Google Search Central — *JavaScript SEO basics* ("not all bots can run JavaScript").
  - **Requer aprovação visual**: Não.

### Categoria: Boas práticas (baixo)

- Lighthouse *Best Practices* 92: erros de console, *issues* no DevTools, *source maps* ausentes de JS first-party, HSTS (já presente `max-age=31536000; includeSubDomains`; avaliar `preload`) e Trusted Types para XSS baseado em DOM.
- **Fonte**: Lighthouse / Google Search Central — *Page experience* (o item não é fator de ranking direto): https://developers.google.com/search/docs/appearance/page-experience

---

## 3. Próximos Passos (ordem sugerida)

> Premissa: **não desativar o WordPress antigo (`www`) ainda** — ele concentra 100% da visibilidade orgânica atual (9.476 de 9.511 cliques do Top 1000). A meta é migrar a visibilidade para `institucional` antes de qualquer desligamento.

1. **✅ (aplicado no código, pendente de deploy) Corrigir canonical/robots/description duplicados** — removidos do `index.html`; build OK. Fazer deploy e validar no GSC (Inspeção de URL → HTML renderizado).
2. **Resolver soft 404** com status HTTP real e remover metadados conflitantes de erro.
3. **Implementar SSR/prerender** para o conteúdo existir no HTML inicial (condição para os destinos de 301 serem indexáveis).
4. **Confirmar a indexação de `institucional`** no GSC (cobertura por host, inspeção de URL, sitemap submetido) — hoje é 0 cliques/0 impressões.
5. **Publicar os 301 dos posts em lote**, priorizando `migration/redirects-priority.csv` (top de tráfego), e monitorar diariamente no GSC.
6. **Consolidar hosts**: `noindex` em `wordpress.crf-al.org.br`; garantir `http→https` e sem `www` duplicado; servir `robots.txt` por host.
7. **Otimizar Core Web Vitals mobile** (LCP: imagens modernas, dimensões, pré-carregamento; cache de borda da API do WP).
8. **Ganhos de CTR** nas páginas de alto volume/baixo CTR (título/description) e **dados estruturados** complementares.
9. **Monitorar** com Search Console (site move + cobertura por host) e Logpush (crawl do Googlebot, soft 404s).

### Nota sobre GA4
GA4 (Google Analytics 4) é a ferramenta de *analytics* de comportamento no site — sessões, engajamento, conversões, origem de tráfego — e é **complementar** ao Search Console (que só cobre cliques/impressões de busca). **Não é necessária para este diagnóstico técnico**; é útil depois, para medir comportamento pós-clique e o efeito da migração. Sem GA4, o GSC já cobre a parte de aquisição orgânica.

### Nota sobre logs (Cloudflare Logpush)
Foi informado que há logs via Logpush, mas nenhum arquivo chegou ao projeto. Para o *log file analysis*, exportar a janela mais recente disponível (ideal: 7–30 dias) com, no mínimo, os campos: `EdgeStartTimestamp`, `ClientRequestHost`, `ClientRequestPath`, `ClientRequestURI`, `ClientRequestUserAgent`, `EdgeResponseStatus`, `RayID`. Com isso é possível medir frequência de crawl por bot, status por host, hit ratio de URLs e desperdício de crawl budget (ex.: crawl em `institucional` vs `www`).


---

## Tarefas de SEO — CRF-AL

- [x] **Remover canonical estático duplicado do `index.html` e manter 1 canonical por página** | Prioridade: Alta | Esforço: Baixo — *aplicado no código; pendente deploy*
  - Descrição: `<link rel="canonical">` removido de `index.html`; canonical agora só via Helmet (por página). Home, notícias e demais rotas com canonical autorreferente único.
  - Fonte: Google Search Central — *How to specify a canonical URL…*; *JavaScript SEO basics*.
  - Impacta identidade visual: Não

- [x] **Eliminar duplicidade/conflito de `meta description` e `meta robots`** | Prioridade: Alta | Esforço: Baixo — *aplicado no código; pendente deploy*
  - Descrição: `description` e `robots` removidos da base estática do `index.html` (o conflito `index, follow` + `noindex, nofollow` na `/404` deixa de existir). `<title>` mantido apenas como fallback pré-render.
  - Fonte: Google Search Central — *Title links*; *Robots meta tag and X-Robots-Tag*.
  - Impacta identidade visual: Não

- [ ] **Exportar as listas de URL por motivo de cobertura (5xx, 404, noindex, redirect)** | Prioridade: Alta | Esforço: Baixo
  - Descrição: No GSC, abrir cada motivo em "Indexação" e exportar a lista de URLs, para corrigir 5xx/404 com precisão (a amostra ao vivo de 71 posts antigos hoje está 100% 200).
  - Fonte: Google Search Central — *Troubleshoot crawling errors*.
  - Impacta identidade visual: Não

- [ ] **Implementar status HTTP 404 real para rotas inexistentes e assets** | Prioridade: Alta | Esforço: Médio
  - Descrição: Adicionar `404.html` + regra no Cloudflare Pages para retornar 404; `_redirects` para rotas legadas. Evitar que `/assets/*` inexistente devolva 200 `text/html`.
  - Fonte: Google Search Central — *JavaScript SEO basics* (soft 404); Google Crawling — *HTTP status codes*.
  - Impacta identidade visual: Não

- [ ] **Confirmar e destravar a indexação de `institucional.crf-al.org.br`** | Prioridade: Alta | Esforço: Médio
  - Descrição: Hoje o host novo tem 0 cliques/0 impressões no GSC. Verificar cobertura por host, submeter `sitemap.xml`, inspecionar URLs e corrigir o que bloqueia indexação (CSR/canonical). Pré-requisito para a migração.
  - Fonte: Google Search Central — *Get started with Search Console*; *JavaScript SEO basics*.
  - Impacta identidade visual: Não

- [ ] **Publicar o mapa de 301 dos posts em lote (priorizando tráfego)** | Prioridade: Alta | Esforço: Médio
  - Descrição: O mapa já existe em `migration/redirects-posts.csv` (2.807) e `redirects-priority.csv`. Publicar **somente após** os destinos estarem renderizando/indexáveis, começando pela lista de prioridade (ex.: glicemia → `/imprensa/noticias/8155`). Monitorar diariamente no GSC. Registrar *site move*.
  - Fonte: Google Search Central — *Move a site with URL changes*; *Redirects and Google Search*.
  - Impacta identidade visual: Não

- [ ] **Não desativar o WordPress antigo (`www`) até a migração estar validada** | Prioridade: Alta | Esforço: Baixo
  - Descrição: `www` responde por ~99,6% dos cliques e ~99,9% das impressões. Desligá-lo sem 301 publicados e sem o novo host ranqueando elimina o tráfego orgânico.
  - Fonte: Google Search Central — *Changing your hosting* / *Move a site with URL changes*.
  - Impacta identidade visual: Não

- [ ] **Aplicar `noindex` e restringir `wordpress.crf-al.org.br` (backend headless)** | Prioridade: Média | Esforço: Baixo
  - Descrição: Host indexável e ranqueando (9 URLs). Aplicar `noindex`/`X-Robots-Tag`, corrigir sitemap para `https://` e, se possível, restringir acesso.
  - Fonte: Google Search Central — *noindex* / *block-indexing*.
  - Impacta identidade visual: Não

- [ ] **Otimizar CTR das páginas de alto volume e baixo CTR** | Prioridade: Média | Esforço: Médio
  - Descrição: Reescrever `title`/description com intenção informacional de saúde (ex.: glicemia capilar 77.763 impr. / 0,25% CTR; ivermectina 27.443 / 0,08%). Aplicar no WP antigo enquanto estiver no ar.
  - Fonte: Google Search Central — *Title links*; *Snippets*.
  - Impacta identidade visual: Não

- [ ] **Excluir rascunhos/teste e filtrar o gerador de sitemap** | Prioridade: Média | Esforço: Baixo
  - Descrição: Remover posts `ola-mundo`, `lorem-ipsum`, `this-is-your-first-post`, `welcome-to-wordpress`, `2074-2`, `teste-definitivo`, `best-dating-sites`. Ajustar `scripts/generate-sitemaps.mjs` para excluir itens irrelevantes.
  - Fonte: Google Search Central — *Spam policies*; *Build and submit a sitemap*.
  - Impacta identidade visual: Não

- [ ] **Servir `robots.txt` em cada host (sem 301 cross-host) e alinhar sitemap ao host canônico** | Prioridade: Média | Esforço: Baixo
  - Descrição: `crf-al.org.br/robots.txt` deve responder 200 apontando para `https://institucional.crf-al.org.br/sitemap.xml` (ou tratar o apex apenas como redirect e declará-lo no GSC).
  - Fonte: Google — *How Google interprets the robots.txt specification*.
  - Impacta identidade visual: Não

- [ ] **Completar sitemap de páginas e corrigir `lastmod`** | Prioridade: Média | Esforço: Médio
  - Descrição: Incluir `eventos/{slug}` e `publicacao/{slug}`; gerar `lastmod` real. Avaliar *news sitemap* válido (namespace `news`).
  - Fonte: Google Search Central — *Build and submit a sitemap*; *News sitemaps*.
  - Impacta identidade visual: Não

- [ ] **Implementar SSR/prerender (conteúdo no HTML inicial)** | Prioridade: Alta | Esforço: Alto
  - Descrição: Edge-render/prerender via Cloudflare Pages Functions (`HTMLRewriter`) ou framework com SSR; CSR como *enhancement*. Elimina dependência de renderização JS para meta e conteúdo.
  - Fonte: Google Search Central — *JavaScript SEO basics* ("server-side or pre-rendering is still a great idea").
  - Impacta identidade visual: Não

- [ ] **Otimizar LCP mobile: imagens modernas, dimensões e pré-carregamento** | Prioridade: Alta | Esforço: Médio
  - Descrição: WebP/AVIF + `srcset`; `width`/`height`/`aspect-ratio` (CLS); `loading="lazy"` fora da dobra; reduzir PNG de 1,5 MB; `fetchpriority` no LCP. Meta: economia estimada de 1.293 KiB (mobile).
  - Fonte: web.dev — *LCP*; Google Search Central — *Lazy-loading best practices*.
  - Impacta identidade visual: **Sim** (validar com design)

- [ ] **Cachear a REST API do WordPress na borda** | Prioridade: Alta | Esforço: Médio
  - Descrição: Cloudflare Cache API/"cache everything" ou materializar notícias em R2/KV (TTFB atual ~2 s; página WP ~5 s). Reduz tempo de render das notícias.
  - Fonte: Google Search Central — *JavaScript SEO basics*. (Complemento de cache: prática de mercado, sem confirmação oficial.)
  - Impacta identidade visual: Não

- [ ] **Adicionar `<SEO>` na página de detalhe de publicação** | Prioridade: Média | Esforço: Baixo
  - Descrição: `PublicationDetailPage.tsx` sem SEO próprio; adicionar título/description/canonical dinâmicos.
  - Fonte: Google Search Central — *Title links*; *Snippets*.
  - Impacta identidade visual: Não

- [ ] **Enriquecer dados estruturados (Organization/ContactPoint, BreadcrumbList, Event)** | Prioridade: Baixa | Esforço: Médio
  - Descrição: Preencher `sameAs`, telefone; adicionar `BreadcrumbList` em notícias e `Event` em eventos; validar logo do publisher.
  - Fonte: Google Search Central — *Article*; *Organization*; *Breadcrumb*.
  - Impacta identidade visual: Não

- [ ] **Fornecer dados complementares (Cobertura do GSC e logs do Logpush)** | Prioridade: Alta | Esforço: Baixo
  - Descrição: Desempenho do GSC já recebido. Faltam: relatório de **Indexação/Cobertura por host** (URLs indexadas vs erros) e **logs Cloudflare Logpush** (User-Agent, path, host, status) para *log file analysis*. GA4 é opcional.
  - Fonte: Google Search Central — *Debug traffic drops*; *Using Search Console and Google Analytics data for SEO*.
  - Impacta identidade visual: Não
