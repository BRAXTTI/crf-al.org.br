# Auditoria inicial de SEO e infraestrutura — CRF-AL

Data: 10/10/2026, America/Maceio. Escopo: repositório, amostra pública em navegador e leitura da API da Cloudflare. As correções descritas abaixo estão locais, pendentes de publicação.

## Conclusão

O portal já entrega metadados específicos no HTML inicial, mas ainda apresenta respostas 200 para recursos inexistentes. A migração do legado está parcial e algumas URLs antigas continuam publicadas com canonical próprio. Dois servidores WordPress seguem necessários para o funcionamento do portal.

A prioridade é publicar e validar as correções de status e cache; depois integrar as notícias novas do WordPress novo, preservando o acervo histórico e suas mídias no legado. Dados de tráfego e indexação atuais ainda precisam ser obtidos no Search Console.

### Direção editorial informada pelo responsável em 10/10/2026

O WordPress antigo permanece porque a importação de suas mídias para o novo não funcionou. A direção desejada é usar exclusivamente o novo WordPress para publicar notícias novas, galerias e eventos. O legado fica como fonte do acervo histórico e das mídias que ainda não foram migradas.

Manter duas fontes nesse cenário é uma escolha operacional justificável. A migração de mídias deixa de ser pré-requisito para começar a publicar no CMS novo. A operação do legado ainda exige atualizações, backups e controle de acesso enquanto ele estiver online, mesmo que não receba novas publicações.

O código atual ainda consulta exclusivamente o WordPress antigo para notícias: listagem/detalhe no frontend, metadados no middleware e gerador do sitemap. Portanto, publicar uma notícia no CMS novo ainda não garante sua aparição no portal. O próximo lote precisa adaptar os três consumidores de forma consistente.

## Arquitetura confirmada

| Componente | Hospedagem/função | Dependências confirmadas |
|---|---|---|
| `institucional.crf-al.org.br` | Cloudflare Pages, projeto `crf-al-org-br`, React/Vite + Pages Functions | Notícias no legado; eventos, galerias e feed editorial de Instagram no WordPress novo |
| `crf-al.org.br` e `www.crf-al.org.br` | DNS aponta para o servidor legado, com proxy Cloudflare | API de notícias e mídias em `/app/uploads`; redirects seletivos executados na Cloudflare |
| `wordpress.crf-al.org.br` | Outro servidor, também com proxy Cloudflare | Eventos, FooGallery/API customizada e conteúdo do Smash Balloon |
| `crf-al-org-br.pages.dev` e `www.institucional.crf-al.org.br` | Domínios adicionais do projeto Pages | Confirmar sua política pública de canonical, redirects e indexação |

O deploy de produção consultado foi criado em 10/10/2026 às 11h27 (Maceió), com commit `dae457cbf22a1053de61891b66c67e10acc218cb`, correspondente ao HEAD local antes deste lote. Isso confirma a referência do deploy; não substitui a validação HTTP de cada comportamento.

Produção e preview têm as mesmas URLs de WordPress configuradas. Uma futura homologação que faça operações editoriais precisa usar uma cópia isolada do CMS para evitar alterar dados reais. O Pages usa compatibility date `2026-09-21`; nenhuma alteração de runtime foi feita.

## Evidências públicas anteriores às correções

| Requisição | Resultado observado | Implicação |
|---|---|---|
| Portal `/` e `/contato` | 200; um title e um canonical por página no HTML inicial; `#root` vazio nesse HTML | Metadados já funcionam; conteúdo principal permanece dependente do JavaScript |
| Portal `/auditoria-rota-inexistente-20261010` | 200 com o shell da aplicação | Soft 404 potencial |
| Portal `/assets/auditoria-inexistente.js` | 200, `text/html`, cache de um ano com `immutable` | Arquivo ausente tratado como sucesso e armazenável por longo prazo |
| Portal `/imprensa/noticias/999999999` | 200 com título genérico | A rota numérica inexistente não recebe 404 |
| Portal `/eventos/auditoria-inexistente` | 404 com metadados de erro | A função já trata parte dos conteúdos dinâmicos inexistentes |
| Portal `/imprensa/noticias/8155` | Destino final por slug com 200 e metadados próprios | Há redirect adicional de ID para slug |
| Álbum de Arapiraca no portal | 200 e metadados específicos do álbum | A integração pública está disponível |
| WordPress novo `/` | 200, canonical próprio e `meta robots` com `index, follow` | A página do backend pode ser indexada |
| API pública de notícias | 200, `X-WP-Total: 2808` | O acervo permanece dependente do servidor antigo |
| APIs de eventos, álbuns e página de Instagram no WordPress novo | 200; a amostra de eventos retornou lista vazia, álbuns retornaram um item | Endpoints estão disponíveis; lista vazia não prova falha ou ausência de todos os eventos no painel |

Notícia recente observada no legado: `/crf-al-alerta-farmaceuticos-sobre-golpes-envolvendo-cobrancas-de-anuidades-pelo-whatsapp/`, ID `107698`. Retorna 200 com canonical em `www.crf-al.org.br`. Seu conteúdo também é consumido pelo portal novo, portanto a consolidação das URLs está pendente para essa amostra. Não foi feita inspeção de indexação dessa URL no Search Console.

As chamadas iniciais de terminal receberam 403. O navegador de auditoria conseguiu acessar o portal e suas APIs. Não há evidência suficiente para atribuir aqueles 403 a um bloqueio do Googlebot.

## Achados e ações

### 1. Respostas HTTP e indisponibilidade — alta prioridade

Corrigir o fallback de SPA sem adicionar um `404.html` que possa impedir os links diretos de páginas válidas. As rotas estáticas conhecidas continuam 200; arquivos existentes e APIs seguem com suas respostas próprias; fallback HTML de rota desconhecida torna-se 404. Notícias por ID inexistente, slugs inválidos e caminhos com segmentos extras também recebem 404.

Ausência confirmada de um conteúdo individual é diferente de uma API inteira responder com erro. Uma coleção de posts/eventos que falha com 403/404/5xx ou uma falha de rede resulta em 503 temporário, `Retry-After: 60` e `Cache-Control: no-store`. Não se aplica `noindex` por uma indisponibilidade temporária. As falhas passam a gerar log estruturado.

Risco operacional: uma página dinâmica sem metadados disponíveis passa a responder 503, mesmo que seu shell React possa abrir. Manter o prazo de quatro segundos para a consulta e validar a estabilidade dos WordPress antes da publicação. Se necessário, um próximo lote pode manter metadados válidos de uma resposta anterior como fallback temporário, com prazo e invalidação definidos.

Fontes: [Google — erros de rastreamento](https://developers.google.com/search/docs/crawling-indexing/troubleshoot-crawling-errors), [Google — códigos HTTP](https://developers.google.com/crawling/docs/troubleshooting/http-status-codes), [Cloudflare — fallback de SPA](https://developers.cloudflare.com/pages/configuration/serving-pages/).

### 2. Migração de URLs ainda parcial — alta prioridade

A API da Cloudflare confirma uma regra ativa de Bulk Redirects ligada à lista `crfal_legacy_redirects`. A leitura completa trouxe 523 entradas: 262 para apex e 261 para `www`. Entradas incluem variações de host e barra final: essa quantidade não equivale a 523 notícias.

356 entradas apontam para `/imprensa/noticias/{id}` e nenhuma aponta diretamente para slug. Como o portal agora redireciona ID para slug, essas entradas criam uma cadeia adicional. Nenhuma entrada preserva a query string; avaliar a necessidade de preservar parâmetros de atribuição ao preparar a revisão.

O campo `num_referencing_filters` da lista retornou zero, mas a leitura da regra de conta confirma que a lista é referenciada e a navegação de uma notícia migrada confirma o destino novo. Não interpretar aquele campo isoladamente como lista inativa.

Próxima ação: exportar o acervo e as regras, comparar por URL/conteúdo, gerar destinos finais por slug e validar 200/canonical/conteúdo antes de atualizar a Cloudflare. APIs, `/app/uploads`, administração e endpoints de plugins precisam ficar fora de qualquer redirect amplo de host. Não redirecionar notícias diferentes para a home. Manter redirects por pelo menos um ano.

Fonte: [Google — migração com mudanças de URL](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes).

### 3. WordPress novo indexável — média prioridade

A home publica canonical próprio e `index, follow`; os endpoints REST amostrados já retornam `X-Robots-Tag: noindex`. Ajustar as páginas HTML do CMS, evitando bloquear APIs, mídias ou integrações públicas.

Para conteúdo duplicado que possui equivalente público, avaliar redirect individual para o portal. Para telas do backend sem equivalente, aplicar `noindex` enquanto o robô puder acessar a diretiva. `Disallow` sozinho não garante remoção do índice e pode impedir a leitura do `noindex`. Proteção de administração e autenticação devem ser planejadas por caminho, sem exigir login para as APIs atualmente consumidas diretamente pelo navegador.

Fonte: [Google — controle de conteúdo na busca](https://developers.google.com/search/docs/crawling-indexing/control-what-you-share).

### 4. TLS e HTTPS na zona — alta prioridade, configuração externa

Leitura atual da Cloudflare:

| Configuração da zona | Valor observado | Próxima ação |
|---|---|---|
| SSL/TLS | `full` | Validar certificados dos dois servidores e então preparar `Full (strict)` |
| TLS mínimo | `1.0` | Avaliar clientes/integradores e preparar mínimo 1.2 |
| Always Use HTTPS | `off` | Verificar o comportamento HTTP de cada host e unificar redirects HTTPS sem loops |
| HSTS da zona | Desativado | Revisar política entre hosts; o portal `/contato` já entrega HSTS por cabeçalho |

Esses valores são da zona; não constituem inventário de possíveis overrides por hostname nem prova de que todo HTTP permanece acessível. O portal `/contato` já entrega CSP, HSTS, `nosniff`, SAMEORIGIN e Referrer-Policy. Evitar afirmar que HSTS está ausente apenas porque a opção da zona está desligada.

Trocar para strict sem certificados válidos no origin pode causar 526; a validação antecede a mudança. Nenhuma configuração externa foi alterada.

Fontes: [Cloudflare — Full (strict)](https://developers.cloudflare.com/ssl/origin-configuration/ssl-modes/full-strict/), [Cloudflare — TLS mínimo](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/).

### 5. Cache de arquivos com nomes fixos — média prioridade

`/images/*` e `/fonts/*` recebem um ano e `immutable` apesar de nomes sem hash. Alterar para revalidação com `max-age=0, must-revalidate`; manter cache longo em `/assets/*`, onde o build produz nomes com hash. A CDN do Pages mantém seu próprio cache, e revalidação pode usar ETag/304.

Limite: publicar cabeçalhos novos não revoga uma cópia que um navegador já guardou por um ano. Se uma imagem já publicada precisar ser substituída imediatamente, usar uma URL nova/versionada.

Fonte: [Cloudflare — cache no Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/).

### 6. Sitemaps e configuração divergente — média prioridade

O sitemap de notícias local possui 2.808 URLs por slug, sem entradas numéricas; a contagem coincide com a API na amostra atual, mas isso não confirma sincronização futura. A atualização é manual (`npm run sitemap:refresh`) e não ocorre no build ou por webhook.

O sitemap estático tinha 21 URLs para 22 rotas com metadados; faltava `/fiscalizacao/afastamento-provisorio`, incluída neste lote sem inventar uma data de modificação. Ainda faltam entradas dinâmicas de eventos e álbuns. Diversos `lastmod` estão fixos em junho; revisar somente com datas de alteração de conteúdo comprovadas.

`VITE_SITE_URL` configura o frontend e o gerador de notícias, mas middleware, robots e sitemap estático usam host fixo. Os valores atuais estão alinhados; a divergência é um risco de manutenção ao trocar o domínio. Centralizar em um próximo lote, com teste de domínio alternativo para todos os consumidores.

### 7. Renderização e desempenho — média prioridade

HTML inicial da amostra contém metadados corretos, mas `#root` vazio. O Google renderiza JavaScript; isso sozinho não prova problema de indexação. SSR/pré-renderização deve ser avaliado para reduzir dependência de API e melhorar entrega de conteúdo, compartilhamento e estabilidade.

Build local: JavaScript principal 720,81 kB (212,68 kB gzip); Vite sinaliza chunk acima de 500 kB. O roteador importa todas as telas antecipadamente. Avaliar divisão por rota com carregamento sob demanda e medir o efeito. Tempos de navegação observados variaram aproximadamente de três a seis segundos em algumas consultas dinâmicas; não são um teste controlado de TTFB ou Core Web Vitals.

O lote remove o corpo completo da notícia e categorias da consulta usada exclusivamente para metadados, mantendo título, resumo, datas e mídia destacada. A consulta de conteúdo do frontend não muda.

Fonte: [Google — JavaScript e SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).

## Primeiro lote implementado

- `functions/_middleware.ts`: 404 para fallback de rotas/arquivos, IDs ausentes e slugs inválidos; tratamento temporário 503; erros sem cache; log estruturado; consulta de metadados menor.
- `public/_headers`: revalidação de imagens e fontes com nomes fixos; cache longo dos assets com hash preservado.
- `public/sitemap-pages.xml`: inclusão de Afastamento Provisório.
- `scripts/test-seo-routing.mjs` e `npm run test:seo`: testes offline de cobertura de rotas/sitemap, status HTTP, arquivos/APIs, redirects, cache e falhas de origin. O HTMLRewriter é simulado nesse teste, não o parser real.

Verificação: build, lint, testes de Instagram, galeria e SEO aprovados. Teste complementar no runtime Cloudflare local com compatibility date de produção e WordPress simulado aprovou transformação real por HTMLRewriter, canonical único, metadados, 404s e 503. Esse ensaio usa ferramentas já disponíveis no ambiente; não foram acrescentadas dependências ao projeto.

## Publicação, validação e reversão

1. Revisar o diff e publicar em uma prévia do Pages, preservando as variáveis atuais.
2. Validar as 22 rotas estáticas e os links diretos de notícia/evento/álbum. Confirmar arquivos existentes, API de Instagram, robots e sitemap.
3. Confirmar 404 para rota inventada, notícia inexistente e arquivo ausente; arquivo ausente deve retornar texto, sem cache `immutable`. Falhas simuladas do CMS devem retornar 503 sem `noindex`.
4. Conferir canonical único antes e depois do JavaScript e os cabeçalhos de imagens/fontes.
5. Após validação da prévia, publicar o lote; monitorar logs e requisições de páginas dinâmicas. A etapa de publicação não foi executada nesta auditoria.
6. Se houver regressão, reativar o deploy anterior no Pages; verificar que as URLs voltaram ao comportamento anterior. Guardar o identificador do deploy anterior e a configuração antes de publicar. Um rollback de código não restaura banco do WordPress nem configurações externas.

## Plano ajustado: CMS novo para publicação, legado para acervo

| Conteúdo | Fonte editorial desejada | Endereço público |
|---|---|---|
| Notícias publicadas a partir da mudança editorial | WordPress novo | Portal institucional, mantendo o padrão de URL de notícia |
| Notícias históricas | WordPress antigo, com novas publicações encerradas após o corte | Portal institucional; URLs antigas tratadas com redirects individuais quando o destino estiver validado |
| Imagens e documentos históricos | Hospedagem antiga, com URLs preservadas | Permanecem carregados nas matérias; não redirecionar seus caminhos para páginas HTML |
| Galerias, eventos e suas novas mídias | WordPress novo | Portal institucional |

### Lote de integração preparado localmente

A categoria **Notícias do portal**, slug `noticias-do-portal`, foi aprovada pelo responsável. A REST pública do CMS novo informou 2.805 posts publicados, muitos provenientes do acervo, e ainda não tinha essa categoria. A REST do legado informou 2.808 posts. Esses números representam a consulta de 10/10/2026, não a quantidade de novas notícias habilitadas.

Foi preparada `/api/news` com filtro editorial, índice de URLs históricas, identidade por fonte e ID, listagem cronológica e detalhes por origem. Homepage, notícias e relacionados usam essa API. Metadados e sitemap usam a mesma regra. O índice reserva as 2.808 URLs antigas; conteúdo e mídia continuam sendo consultados na origem. A ausência da categoria não libera as cópias importadas.

Build, lint e testes de notícias/SEO passaram. Foram verificados em runtime local Cloudflare, com respostas de WordPress simuladas: API, sitemap, metadados, canonical, 404 e 503. Instagram e galerias também passaram nos seus testes existentes. O bundle principal continua acima de 500 kB; sua otimização é um lote separado.

Ainda falta criar a categoria, validar uma publicação legítima na prévia, atualizar o índice caso o legado mude antes do corte e publicar o portal. Nenhuma configuração externa, categoria ou deployment foi alterado. Procedimento: [publicacao-noticias-portal.md](./publicacao-noticias-portal.md).

### Sequência de implementação e validação

1. Inventariar os posts já existentes no novo CMS: identificar eventuais cópias importadas, conteúdo de teste, imagens destacadas e anexos faltantes. Conferir REST pública e permissões de leitura de publicações; não pressupor que todos os posts do novo CMS sejam novos ou estejam íntegros.
2. Registrar o início da publicação exclusiva no novo CMS. A data de corte organiza o trabalho editorial, mas a origem técnica de uma matéria deve ser registrada explicitamente; conteúdos retroativos ou alterados não podem mudar de fonte apenas por causa da data.
3. Preparar uma camada de notícias que conhece as duas fontes. Recomendação: servir ao frontend uma API do próprio portal para centralizar resolução, cache, paginação e falhas. O middleware de SEO e o sitemap devem usar a mesma regra de origem.
4. Combinar as listagens por data de publicação, com paginação e contagem corretas. Não concatenar apenas a página 1 de cada WordPress: isso pode omitir ou repetir matérias nas páginas seguintes. Separar cópias importadas antes de contar os conteúdos.
5. Identificar conteúdo por `(origem, ID)` internamente: IDs de instalações distintas podem coincidir. Auditar slugs repetidos e reservar uma URL pública única por matéria. As URLs existentes de notícias históricas devem continuar resolvendo o mesmo conteúdo; a ordem de consulta não pode permitir que uma notícia nova sobrescreva uma antiga com slug igual.
6. Resolver detalhe, capa, corpo, autor, relacionados, metadados e sitemap segundo a origem da matéria. Manter as URLs históricas de `/app/uploads` sem exigir cópia imediata das imagens. As antigas rotas numéricas continuam identificando notícias do legado.
7. Distinguir ausência de conteúdo de indisponibilidade do CMS. Uma falha no novo WordPress não deve fazer a mesma URL abrir uma matéria diferente no antigo. Validar comportamento degradado de listagem, cache e status temporário de detalhe.
8. Testar em prévia com dados simulados e leitura de publicações existentes: notícia nova, histórica, colisão de IDs/slugs, imagens e PDFs antigos, paginação, metadados, sitemap e indisponibilidade de cada fonte. Publicação de conteúdo de teste no WordPress requer etapa editorial explícita.
9. Após a integração validada, centralizar a publicação no novo WordPress. Restringir alterações editoriais no legado de acordo com os responsáveis, mantendo administração para manutenção e correção do acervo quando necessário.

### Evolução futura opcional

Investigar a falha de importação de mídias separadamente, com backup e ambiente isolado. Se o acervo for migrado futuramente, preservar slugs, datas, autores, taxonomias, mídia destacada, imagens embutidas, PDFs e referências a IDs; usar tabela de correspondência quando necessário.

O servidor antigo só pode ser retirado depois que nenhuma API, imagem ou documento depender dele e as URLs antigas continuarem atendidas por redirects ou armazenamento adequado. Essa retirada deixa de ser objetivo imediato.

## Lacunas que impedem conclusões adicionais

- Painéis e arquivos dos WordPress: versões, plugins, vulnerabilidades, backups, MFA, permissões, jobs e recuperação ainda não verificados. Não há evidência de comprometimento nesta análise.
- Search Console atual: indexação por URL/host, canonical escolhido pelo Google, consultas, tráfego e listas de erros. Exportações de setembro são históricas; ausência de impressões não prova ausência do índice.
- Logs de CDN/origin: comportamento de Googlebot, frequência de falhas, cache hit e capacidade sob carga. Não foi feita análise de logs de tráfego.
- Core Web Vitals de campo e PageSpeed atual: sem medição nova; não reutilizar os números de setembro como atuais.
- Domínios alternativos, HTTP e lista completa de conteúdo duplicado: precisam de validação adicional antes de regras globais.

O relatório de 26/09 permanece como histórico. Este documento atualiza os pontos confirmados e corrige a premissa de que não havia redirects de notícias publicados: há uma lista parcial ativa.
