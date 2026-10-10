---
version: alpha
name: CRF-AL
description: Portal institucional e central de serviços do Conselho Regional de Farmácia de Alagoas.
colors:
  primary: '#003366'
  dark: '#0B192C'
  accent: '#C59B27'
  background: '#F8FAFC'
---

## Contexto e identidade

Portal em português brasileiro para profissionais farmacêuticos e estabelecimentos de Alagoas. A central de serviços prioriza encontrar requerimentos por perfil e busca. Preservar a identidade institucional azul e o símbolo da taça de Hígia; evitar decoração que afaste o conteúdo principal.

## Fontes canônicas

`tailwind.config.js` define cores, tipografia e utilitários. `src/index.css` define fontes Rawline, container e `--header-offset`. Este documento registra as decisões e não gera tokens.

## Tipografia e superfícies

Rawline, hospedada localmente, para títulos e texto. Azul #003366, azul escuro #0B192C, dourado #C59B27 e superfícies #F8FAFC seguem os tokens existentes. Manter foco visível e contraste WCAG AA.

## Cabeçalhos de serviços

`src/components/block/page-hero.tsx` é o componente compartilhado. A variante `compact` é o padrão em todas as páginas internas: breadcrumb e título à esquerda, estatísticas à direita em desktop (a partir de 1024px). Desktop: altura de 203px. Tablet e celular: padding vertical de 40px e altura natural para acomodar conteúdo. Título clamp(28px, 3vw, 40px), gradiente preservado; cards com raio 12px e padding 12px 20px. Imagem à direita como marca d’água. A barra fixa usa o espaço definido por `--header-offset`.

Abaixo de 1024px, empilhar título e estatísticas. Em telas estreitas, estatísticas mantêm uma linha com rolagem horizontal acessível por teclado. Títulos longos quebram naturalmente para preservar legibilidade. Detalhes de eventos mantêm data, local e status. `PageHeroStats` é o componente canônico de estatísticas. A variante `default` permanece disponível para banners editoriais explícitos.

## Arte dos cabeçalhos

`public/images/page-hero-premium-v2.jpg`: composição gerada a partir do logo e banner existentes, com taça de Hígia em azul metálico, fitas translúcidas e contornos dourados. Área esquerda escura para títulos; imagem posicionada à direita e overlay escuro para leitura. A arte não contém texto ou logotipo.

## Proporções das artes responsivas

Arte desktop `page-hero-desktop-v3.jpg`: encaixada pela altura, à direita, sem cortar a taça; o fundo azul preenche a extensão panorâmica. Arte mobile `page-hero-mobile-v3.jpg`: composição específica próxima de 375:247, aplicada abaixo de 1024px. Requerimentos mede aproximadamente 247px em 375px de largura. Títulos maiores podem aumentar a altura no celular para evitar cortes.

## Arte do card do Instagram

`public/images/instagram-card-background-v1.jpg`: fundo azul com taça de Hígia, fitas suaves e detalhes dourados concentrados à direita. Imagem decorativa sem texto, com camada azul sobreposta para preservar a leitura. Aplicar apenas ao painel de apresentação da seção Instagram; manter altura natural e carregamento adiado. O painel não estica junto à grade: usa alinhamento ao topo, padding de 16/24/20px e título de 18/24/20px conforme o breakpoint. Em mobile, título e ação ficam lado a lado, sem descrição secundária. Em desktop, ocupar 30% da largura e deixar 70% para as postagens. Remover o rodapé redundante de identificação; priorizar as publicações.

## Cards no celular

Abaixo de 640px, estatísticas dividem igualmente a largura disponível, com padding horizontal de 8px, números de 24px e rótulos de 10px centralizados, com quebra de linha. Gap de 8px e largura mínima de 80px; rolagem disponível apenas quando necessária. A partir de 640px, preservar cards com padding de 20px, números de 28px e rótulos de 12px. A altura mobile acompanha o conteúdo.

## Galeria de Fotos

Em Imprensa, cada galeria publicada do FooGallery corresponde a um álbum. Usar o cabeçalho compacto e os tokens existentes. Capas e miniaturas têm proporção 4:3; fotos ampliadas preservam o enquadramento completo. Álbuns usam até três colunas; fotos usam duas colunas no celular e três no desktop. A ampliação reutiliza o Dialog acessível, com fechamento em português, Escape, restauração de foco e navegação pelas setas. Não exibir a data de publicação como data do evento.

## Página inicial: serviços e enquadramento

Priorizar CRF em Casa (sistema externo, nova aba anunciada) e Serviços e Requerimentos (orientações internas) antes das notícias. `ServiceAccessCards` usa dois cards a partir de 768px. Abaixo disso, usar um bloco de duas faixas contíguas, com cantos arredondados apenas nas extremidades, título à esquerda e ação “Acessar” à direita, sem descrição. A segunda faixa usa azul claro para distinguir os destinos. Imagens decorativas sem texto, azul institucional e textos HTML. Os fundos gerados mostram atendimento digital e documentos, com detalhes dourados. `crf-em-casa-card-v2.webp` preserva o cenário do notebook e insere na tela a captura do sistema CRF em Casa fornecida pelo usuário. Botões visuais pertencem ao único link de cada card.

Cards e `HeroSlider` compartilham `.container-crfal` de `src/index.css`: max-width 1280px, padding de 16/24/32px. Preservar as proporções 4:5 mobile e 16:5 desktop das artes do slider. O deslocamento inicial do cabeçalho fica na composição da home, aplicado uma única vez. Pontos de navegação e controle de reprodução ficam abaixo da arte do slider, com alvos de 44px e azul sobre fundo claro. Seções editoriais usam padding vertical 40px mobile e 56px desktop. As transições entre os destaques, serviços por perfil, notícias e Instagram são delimitadas por bordas superiores de 1px em crfal-gray-200. Alternar fundos: serviços e Instagram em branco, destaques e notícias em crfal-gray-50; manter as divisórias discretas e sem espaço adicional. A seção de indicadores institucionais não é exibida na página inicial. A antiga grade “Conheça o CRFAL” foi substituída por `ServiceProfiles`: três painéis azuis para Empresas, Farmacêuticos e Cidadão, com ícone, título, cinco links separados por linhas e ação ao final. Três colunas em desktop (1024px), uma coluna abaixo. `src/config/service-profiles.ts` é a fonte canônica compartilhada com o cabeçalho. Os links para categorias de requerimentos usam `perfil` e `categoria` na URL; categorias inválidas retornam à lista completa.

## Cabeçalho mobile por perfil

Abaixo de 1024px, barra azul de 80px com menu à esquerda, logo branca oficial sobre o azul, sem superfície branca e busca à direita. Faixa branca de 96px com três acessos iguais: Empresas (Building2, requerimentos com `perfil=pessoa-juridica`), Farmacêuticos (PillBottle, `perfil=pessoa-fisica`) e Cidadão (UserRound, Ouvidoria). Usar ícones Lucide de 32px com traço 1.5, divisórias discretas e rótulos legíveis em 320px. Apenas a barra principal de 80px permanece fixa; a faixa de perfis fica no início da página e sai durante a rolagem. `--header-offset` em `src/index.css` acompanha 80px mobile e 132px desktop para elementos fixos/sticky; `--page-header-offset` reserva inicialmente 176px mobile e 132px desktop. A busca usa o Dialog compartilhado para pesquisar nomes das páginas e serviços da navegação, com limpar, estado vazio e fechamento por Escape. O filtro de perfil dos requerimentos acompanha a URL e reinicia os filtros locais ao mudar de perfil.

## Menu de navegação mobile

`MobileNavigation` reutiliza `DialogContent` na variante compartilhada `drawer`: painel pela direita, largura máxima 420px, altura `100dvh`, animação de entrada/saída de 300ms e fundo escurecido. Respeitar movimento reduzido. Cabeçalho e fechamento permanecem visíveis, com rolagem interna e padding de área segura ao final. O Dialog gerencia foco, Escape, clique fora e bloqueio da rolagem de fundo; ao fechar, devolver foco ao botão de menu. Fechar ao navegar ou passar para desktop. Incluir Página inicial, atalhos por perfil, CRF em Casa e navegação principal. Submenus usam acordeão de abertura única, `aria-expanded`, `aria-controls` e `inert` quando fechados; links da página atual usam `aria-current`. Links externos indicam nova aba. Evitar links dentro de botões.
