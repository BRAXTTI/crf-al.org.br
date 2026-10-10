# Falha de publicação no WordPress novo

Mensagem relatada: `Publishing failed. The response is not a valid JSON response.`

## Verificação após salvar os links permanentes

O responsável informou a publicação de uma notícia de teste. A leitura pública confirmou o post 16764, título “teste”, slug `teste-2`, categoria 75 (`noticias-do-portal`), publicado em 10/10/2026. A rota `/wp-json/wp/v2/posts?per_page=1&_fields=id` passou a responder 200 com JSON válido. A falha pública de roteamento observada abaixo não se reproduziu nesta verificação posterior.

A integração local foi executada contra as APIs reais: índice com 2.809 entradas, notícia nova em primeiro lugar, detalhe com título e corpo corretos, e listagem combinada com matérias históricas da fonte antiga. O post de teste não possui imagem destacada; essa verificação não valida o carregamento de uma capa nova. O portal ainda não foi publicado com a integração.

## Evidências públicas em 10/10/2026

Consultas GET em sessão isolada Chromium, sem autenticação e sem publicar conteúdo:

| Rota em wordpress.crf-al.org.br | Status | Resposta |
|---|---|---|
| `/wp-json/` | 404 | HTML, página “Hospedagem Locaweb” |
| `/wp-json/wp/v2/posts?per_page=1&_fields=id` | 404 | HTML, página “Hospedagem Locaweb” |
| `/index.php?rest_route=/wp/v2/posts&per_page=1&_fields=id` | 200 | JSON válido, post 16367 |
| `/index.php?rest_route=/wp/v2/types/post&context=edit` | 401 | JSON válido, `rest_forbidden_context`, esperado sem login |

A homepage anuncia `https://wordpress.crf-al.org.br/wp-json/` no link de descoberta da REST API. Existe, portanto, incompatibilidade entre o endereço anunciado pelo WordPress e o roteamento atendido pela hospedagem.

Consultas com urllib receberam bloqueio Cloudflare 403/1010 em todas as rotas. O navegador acessou as rotas e revelou o erro 404 da hospedagem. Esse bloqueio do cliente de teste não comprova bloqueio da publicação do usuário.

## Diagnóstico e limite da conclusão

Há uma falha confirmada no roteamento público `/wp-json/`. Regras de reescrita ausentes ou não aplicadas são a principal hipótese. A resposta HTML explica o tipo de mensagem relatada, mas a requisição autenticada de publicação ainda não foi capturada. Não foram verificados `.htaccess`, configuração do servidor, logs PHP ou painel administrativo.

A categoria do portal não configura as regras REST e não há evidência de que seja a causa. As alterações locais do portal ainda não foram publicadas e não modificaram o editor WordPress.

## Correção e validação

1. Preservar o texto da notícia em edição. No WordPress novo, abrir Configurações → Links permanentes e salvar a configuração atual, sem mudar a estrutura. Isso permite ao WordPress atualizar suas regras.
2. Repetir GET em `/wp-json/` e `/wp-json/wp/v2/posts?per_page=1&_fields=id`. As respostas precisam ser JSON, não HTML de erro.
3. Se continuar 404, verificar a configuração de reescrita no servidor e o diretório real desta instalação. Em Apache, conferir as regras WordPress no `.htaccess`, seu carregamento e as permissões necessárias; em Nginx/IIS, usar a configuração correspondente. Não substituir regras existentes às cegas nem alterar o WordPress antigo.
4. Com a API funcional, validar salvar como rascunho no editor autenticado. Se o erro persistir, inspecionar URL, status, Content-Type e corpo da requisição de gravação na aba Network; não compartilhar cookies, nonce ou cabeçalhos de autenticação.
5. Só publicar a notícia quando o responsável editorial desejar. Não criar publicação pública apenas para testar infraestrutura.

Referências oficiais:

- https://developer.wordpress.org/rest-api/extending-the-rest-api/routes-and-endpoints/
- https://wordpress.org/documentation/article/settings-permalinks-screen/
