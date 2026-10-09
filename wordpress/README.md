# Galeria de Fotos — CRF-AL

O portal usa o FooGallery para gerenciar as fotos no WordPress e uma interface
React em `/imprensa/galeria-de-fotos`. Cada **galeria do FooGallery** corresponde
a um álbum no portal. Os agrupadores da extensão Albums do FooGallery não são
listados: as fotos são selecionadas em cada galeria, como a de Arapiraca.

## Instalar o complemento

1. No painel de `wordpress.crf-al.org.br`, abra **Plugins → Adicionar plugin → Enviar plugin**.
2. Selecione `crfal-photo-gallery.zip`, clique em **Instalar agora** e depois **Ativar**.
3. Mantenha o FooGallery ativo. O complemento não modifica suas galerias.
4. Abra `https://wordpress.crf-al.org.br/index.php?rest_route=/crfal/v1/photo-albums`.
   A resposta deve conter `albums`, incluindo a galeria `entrega-de-carteiras-arapiraca`.
5. Abra `https://wordpress.crf-al.org.br/index.php?rest_route=/crfal/v1/photo-albums/entrega-de-carteiras-arapiraca`.
   Confira `photos` com cinco imagens e compare a ordem com o FooGallery.
6. Após publicar o frontend, abra **Imprensa → Galeria de Fotos** e teste o álbum.

Alternativa: copiar a pasta `crfal-photo-gallery` para `wp-content/plugins/` e
ativar **CRF-AL — API da Galeria de Fotos**. Não colar este arquivo inteiro em
Code Snippets: ele é um plugin instalável, com cabeçalho PHP próprio.

## Como publicar

Em **FooGallery → Adicionar galeria**, selecione as fotos, organize-as e publique.
Galerias em rascunho, privadas ou protegidas por senha não aparecem na API pública.
A imagem destacada, se estiver entre as fotos selecionadas, será a capa; caso
contrário, será usada a primeira foto na ordem retornada pelo FooGallery.
Legendas e textos alternativos são editados na biblioteca de mídia do WordPress.
O portal não apresenta a data de publicação como se fosse a data do evento.

O complemento utiliza `FooGallery::get_by_id()->attachments()`, respeitando a
seleção e a ordenação do plugin, inclusive para fotos reutilizadas de outras
galerias. A implementação contempla imagens da biblioteca de mídia; fontes
externas de versões PRO e vídeos não fazem parte desta integração.

## API e cache

- `GET /crfal/v1/photo-albums?page=1&per_page=12`: capas e contagens; máximo de 24 por página.
- `GET /crfal/v1/photo-albums/{slug}`: álbum com `photos`, na ordem do FooGallery.
- As respostas incluem URLs da imagem completa e da miniatura `medium_large`,
  largura, altura, legenda e texto alternativo.
- Cache HTTP e stale time do React Query: 60 segundos cada. Um cliente já aberto
  pode precisar atualizar após até dois minutos para ver uma alteração.
- Sem FooGallery ativo, retorna 503; álbum inexistente ou não público retorna 404.
- Não requer credenciais no frontend. Usa o CORS padrão da REST API do WordPress.

O endpoint nativo `/foogallery/v1/galleries` permanece protegido. Não se usa
`media?parent=ID` como substituto, porque ele não representa a seleção de fotos
da galeria nem sua ordem.

## Validação

`npm run build` e `npm run lint` validam o frontend. O teste
`node scripts/test-photo-gallery.mjs` verifica URLs, paginação, cancelamento e
erros da API sem depender de acesso ao WordPress.

O complemento foi ativado no WordPress em 09/10/2026. A listagem e o detalhe
retornaram HTTP 200 sem autenticação; o álbum de Arapiraca retornou as cinco
fotos (IDs 16493 a 16497) e a capa 16493. Os testes iniciais locais de navegador
usaram essas mídias públicas como dados simulados do novo endpoint.
