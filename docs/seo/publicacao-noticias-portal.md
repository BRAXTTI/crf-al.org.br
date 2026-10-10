# Publicação de notícias no portal

Decisão aprovada em 10/10/2026: publicar notícias futuras, galerias e eventos no WordPress novo. Manter o WordPress antigo e suas mídias para o acervo.

## Configuração editorial

No novo WordPress, abrir **Posts → Categorias** e criar:

- Nome: **Notícias do portal**
- Slug: **noticias-do-portal**

Ao publicar uma notícia nova, marcar essa categoria. Outras categorias editoriais podem continuar sendo usadas. Não marcar em massa as cópias importadas: isso pode duplicar conteúdo. Galerias e eventos mantêm seus fluxos atuais, sem depender desta categoria.

A categoria foi criada pelo responsável e confirmada na API pública em 10/10/2026: ID 75, nome “Noticias do Portal”, slug `noticias-do-portal`, zero posts marcados. Enquanto estiver vazia, a integração mostra apenas o acervo. A categoria organiza a integração; não funciona como controle de acesso: posts publicados fora dela continuam públicos no próprio WordPress.

Usar slugs descritivos e exclusivos. Slugs apenas numéricos são reservados às rotas antigas por ID. Se o slug já pertence ao acervo, alterar o slug da notícia nova: a versão antiga conserva a URL e a nova fica fora da listagem e do sitemap até receber uma URL exclusiva.

## Funcionamento técnico

- `/api/news?page=1&per_page=12`: listagem conjunta, ordenada pela data de publicação em UTC.
- `/api/news?slug=...`: detalhe da matéria com a origem correta.
- O índice local reserva 2.808 notícias históricas, consultadas em 10/10/2026. Corpo, capa, autor e anexos continuam vindos do WordPress de origem. Nenhuma mídia foi migrada.
- IDs são identificados pela combinação de fonte e número. IDs iguais em instalações distintas não conflitam.
- O middleware entrega os metadados de cada fonte no HTML inicial. `/sitemap-news.xml` reúne as mesmas URLs, incluindo as novas publicações sem exigir novo build.
- Dados públicos bem-sucedidos têm cache de até 60 segundos em cada camada. Falhas não são armazenadas. Uma indisponibilidade produz 503; uma matéria histórica nunca é substituída pela cópia do outro CMS. A listagem pode ficar indisponível quando alguma fonte necessária falhar; detalhes da outra fonte continuam independentes.

O índice novo suporta até 4.000 posts da categoria. Antes de atingir esse volume, substituir a coleta paginada por índice persistente atualizado por publicação/webhook. Esse limite mantém o número de consultas dentro do orçamento de subrequisições do runtime usado aqui.

## Validação e entrada em produção

1. Criar a categoria e conferir seu slug.
2. Antes do corte editorial, executar `npm run news:archive` se houve publicação, remoção, alteração de slug ou data no WordPress antigo. Revisar o diff do índice: mudanças de URLs históricas exigem redirects individuais. O comando preserva o arquivo anterior quando a leitura falha ou está incompleta.
3. Validar em uma prévia do portal uma notícia legítima recém-publicada na categoria: título, corpo, capa, autor, links, mobile, compartilhamento e sitemap. As cópias importadas precisam continuar fora da integração.
4. Conferir uma notícia antiga e seus anexos, uma rota antiga por ID e as páginas seguintes da listagem.
5. Publicar a versão validada do portal e comunicar o início do uso exclusivo do novo CMS para notícias futuras.

Além dos testes simulados, o responsável publicou uma notícia de teste em 10/10/2026 (ID 16764, slug `teste-2`). A integração local foi validada com as APIs reais: título, corpo, categoria, primeira posição na listagem e coexistência com o acervo antigo. A notícia não tem imagem destacada, portanto uma capa nova ainda precisa ser validada. Nenhuma notícia foi criada pelo agente e a integração ainda não foi publicada no portal. Antes da entrada em produção, retirar o conteúdo de teste da publicação pública ou substituí-lo por uma notícia legítima, conforme decisão editorial.

Manter backups e acesso administrativo do legado. Após o corte, corrigir o acervo com cuidado: exclusões podem exigir atualização do índice, e mudanças de slugs exigem redirects. A integração falha explicitamente se uma página pede posts reservados que o legado deixou de retornar, evitando mostrar contagem enganosa.

## Retorno à versão anterior

Restaurar o deployment anterior do portal. Preservar os posts publicados no CMS novo durante a transição e comunicar a pausa editorial; a versão anterior não os incorpora. Não apagar a categoria, o acervo ou as mídias como parte do retorno.
