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

`src/components/block/page-hero.tsx` é o componente compartilhado; a variante `compact` (padrão) é um cabeçalho editorial escuro. Estrutura: breadcrumb completo com separadores dourados (no celular, vira o link “← <página anterior>”), rótulo dourado da seção com traço de 24px (vem de `section`, `eyebrow` ou do breadcrumb), título de 30/40/48px com tracking -0,02em e entrada suave (desativada com movimento reduzido), frase de apoio (`lead`, uma frase útil, até 2 linhas no desktop), dados em linha (`meta`: número em negrito branco e rótulo em minúsculas, separados por pontos dourados a partir de 640px) e ações (`actions` com `PageHeroAction`: primária branca, secundária vazada; à direita no desktop, abaixo do texto no celular). Fundo: gradiente azul, textura de grade de 48px com máscara radial, brilhos azul e dourado desfocados, arte da taça (`page-hero-desktop-v3.jpg`) só a partir de 1024px, com 35% de opacidade e máscara, e fio dourado de 1px na base. Sem estatísticas em caixas: `PageHeroStats` existe só por compatibilidade e renderiza o mesmo formato de `meta`. Esconder números que ainda não carregaram (nunca mostrar 0 ou —).

## Abas por seção

`src/config/section-nav.ts` define as abas de Instituição, Serviços, Fiscalização e Imprensa. Com `section`, o cabeçalho mostra as páginas da seção na base, separadas por uma borda branca a 10%, com sublinhado dourado na página atual (`aria-current`); `matchPrefix` mantém a aba ativa em subpáginas (álbuns, notícias, eventos). No celular, as abas rolam na horizontal e centralizam a ativa. Links externos têm seta diagonal e aviso de nova aba. As abas substituem o dropdown “Navegação da Fiscalização” no celular; no desktop, o menu lateral da Fiscalização permanece.

## Arte dos cabeçalhos

`public/images/page-hero-premium-v2.jpg`: composição gerada a partir do logo e banner existentes, com taça de Hígia em azul metálico, fitas translúcidas e contornos dourados. Área esquerda escura para títulos; imagem posicionada à direita e overlay escuro para leitura. A arte não contém texto ou logotipo.

## Proporções das artes responsivas

Arte desktop `page-hero-desktop-v3.jpg`: encaixada pela altura, à direita, sem cortar a taça. No cabeçalho editorial, a arte não aparece abaixo de 1024px: no celular, o fundo é só gradiente, textura e brilho, para priorizar o conteúdo. `page-hero-mobile-v3.jpg` continua disponível para a variante `default`.

## Instagram na página inicial

`InstagramFeed` segue o cabeçalho das seções da home: rótulo dourado “No Instagram · @crfal”, título, traço dourado, frase de apoio e “Seguir @crfal” à direita. Uma única fileira: 4 publicações em 4:5 e o card “Siga o CRF-AL” a partir de 1024px (5 colunas); 3 publicações e o card entre 768px e 1023px; no celular, carrossel horizontal com snap e 72% de largura por card, deixando o próximo aparecer. Cada publicação mostra a imagem inteira sobre a própria versão desfocada, selo “Vídeo” ou “Carrossel” quando for o caso, data em rótulo dourado e até duas linhas da legenda; o rótulo acessível usa data e legenda. `functions/api/_parse.ts` extrai legenda (texto alternativo do Smash Balloon, descartando “Instagram post …”), data (`data-date`) e tipo (`sbi_type_*`); a chave de cache da função usa `version=3`. O card “Siga” usa `public/images/instagram-card-background-v1.jpg` com camada azul em gradiente vertical, fio dourado e botão em pílula. Carregamento com esqueleto do mesmo layout; sem publicações, mensagem e card de seguir lado a lado.

## Galeria de Fotos

Em Imprensa, cada galeria publicada do FooGallery corresponde a um álbum. Usar o cabeçalho compacto e os tokens existentes. Capas e miniaturas têm proporção 4:3; fotos ampliadas preservam o enquadramento completo. Álbuns usam até três colunas; fotos usam duas colunas no celular e três no desktop. A ampliação reutiliza o Dialog acessível, com fechamento em português, Escape, restauração de foco e navegação pelas setas. Não exibir a data de publicação como data do evento.

## Página inicial: serviços e enquadramento

Priorizar CRF em Casa (sistema externo, nova aba anunciada) e Serviços e Requerimentos (orientações internas) antes das notícias. `ServiceAccessCards` usa dois cards a partir de 768px. Abaixo disso, usar um bloco de duas faixas contíguas, com cantos arredondados apenas nas extremidades, título à esquerda e ação “Acessar” à direita, sem descrição. A segunda faixa usa azul claro para distinguir os destinos. Imagens decorativas sem texto, azul institucional e textos HTML. Os fundos gerados mostram atendimento digital e documentos, com detalhes dourados. `crf-em-casa-card-v2.webp` preserva o cenário do notebook e insere na tela a captura do sistema CRF em Casa fornecida pelo usuário. Botões visuais pertencem ao único link de cada card.

Cards e `HeroSlider` compartilham `.container-crfal` de `src/index.css`: max-width 1280px, padding de 16/24/32px. Preservar as proporções 4:5 mobile e 16:5 desktop das artes do slider. O deslocamento inicial do cabeçalho fica na composição da home, aplicado uma única vez. Pontos de navegação e controle de reprodução ficam abaixo da arte do slider, com alvos de 44px e azul sobre fundo claro. Seções editoriais usam padding vertical 40px mobile e 56px desktop. As transições entre os destaques, serviços por perfil, notícias e Instagram são delimitadas por bordas superiores de 1px em crfal-gray-200. Alternar fundos: serviços e Instagram em branco, destaques e notícias em crfal-gray-50; manter as divisórias discretas e sem espaço adicional. A seção de indicadores institucionais não é exibida na página inicial. A antiga grade “Conheça o CRFAL” foi substituída por `ServiceProfiles`: título visível “Como podemos ajudar você?” com rótulo “Central de serviços” e link para todos os requerimentos; três painéis em gradiente azul (#003366 → #0B192C) para Empresas, Farmacêuticos e Cidadão, com fio dourado de 2px no topo, ícone em círculo com anel dourado, ícone ampliado como marca d’água (6%), descrição curta, cinco links de 15px separados por linhas com seta deslizante (dourada no hover) e ação ghost de largura total ao final. Dourado como texto sobre fundo branco usa #8A6A12 para contraste AA. Três colunas em desktop (1024px), uma coluna abaixo. `src/config/service-profiles.ts` é a fonte canônica compartilhada com o cabeçalho. Os links para categorias de requerimentos usam `perfil` e `categoria` na URL; categorias inválidas retornam à lista completa.

## Página inicial: notícias

`Publications` segue o padrão de `ServiceProfiles`: rótulo dourado (#8A6A12) “Informação para a profissão”, título “Últimas notícias” com traço dourado e link “Todas as notícias” com seta deslizante. As artes do WordPress têm proporções variadas e texto, então nunca são cortadas: `NewsImage` exibe a imagem inteira (`object-contain`) sobre uma cópia desfocada dela mesma, em vez de faixas vazias. Destaque em 16:10 com selo “Em destaque” dourado, fio dourado entre imagem e texto, título de 22/26px e elevação suave no hover. Categorias genéricas (Blog, Geral) não são exibidas. A lista lateral usa miniaturas 4:3, data em rótulo maiúsculo, título com até três linhas, divisórias e seta que aparece no hover, sem repetir “Ler notícia”. O carregamento usa esqueleto com o mesmo layout.

## Central de Requerimentos

Perfis com o mesmo vocabulário da home: “Farmacêuticos” (subtítulo “Pessoa física”, PillBottle) e “Empresas” (“Pessoa jurídica”, Building2); o parâmetro `perfil` continua `pessoa-fisica`/`pessoa-juridica`. Estatísticas do cabeçalho refletem o perfil ativo (requerimentos e categorias). Categorias usam rótulo dourado (#8A6A12) com a contagem, título azul e traço dourado. Requerimentos são linhas, não cards: painel branco com divisórias de 1px, duas colunas a partir de 1024px (último item ímpar ocupa a largura toda), ícone em círculo, título, descrição em uma linha (duas no celular), prazo com relógio dourado e seta que desliza no hover. A busca mostra a contagem no perfil ativo e oferece “ver N em <outro perfil>”, levando o termo via `q`. Cada requerimento tem link próprio (`item=<id>`), com “Copiar link” no detalhe. No detalhe: cabeçalho em gradiente com fio dourado e ícone em marca d’água; vídeo só aparece quando há URL; observações ficam sempre visíveis no topo, em alerta âmbar; abas acessíveis (tablist, setas) “Documentos” e “Como solicitar”, com indicador dourado. Documentos são um checklist com progresso dourado, salvo por requerimento no `localStorage` (com try/catch) e botões “Limpar” e “Imprimir lista”. Um bloco final em gradiente leva ao CRF AL em Casa.

## Cabeçalho mobile por perfil

Abaixo de 1024px, barra azul de 80px com menu à esquerda, logo branca oficial sobre o azul, sem superfície branca e busca à direita. Faixa de acesso por perfil apenas na página inicial: 72px, branca, três acessos iguais — Empresas (Building2, requerimentos com `perfil=pessoa-juridica`), Farmacêuticos (PillBottle, `perfil=pessoa-fisica`) e Cidadão (UserRound, Ouvidoria) — com ícone de 18px em círculo azul-claro, rótulo de 12,5px em semibold, divisórias discretas e traço dourado ao tocar. Nas páginas internas a faixa não aparece; os perfis seguem no menu e na seção “Como podemos ajudar você?”. Apenas a barra principal de 80px permanece fixa. `--header-offset` acompanha 80px mobile e 132px desktop para elementos fixos/sticky; `--page-header-offset` reserva 80px mobile e 132px desktop nas páginas internas; `--home-header-offset` reserva 152px mobile (barra + faixa) e 132px desktop na home. A busca usa o Dialog compartilhado para pesquisar nomes das páginas e serviços da navegação, com limpar, estado vazio e fechamento por Escape. O filtro de perfil dos requerimentos acompanha a URL e reinicia os filtros locais ao mudar de perfil.

## Fale Conosco

Ordem: canais de atendimento, “Qual setor procurar?”, setores e Diretoria, onde estamos e fechamento da Ouvidoria. O cabeçalho mostra o status ao vivo do expediente (seg. a sex., 9h–17h, horário de Maceió, sem feriados): ponto verde pulsante “Aberto agora · fecha às 17h” ou “Fechado · abre …”. Canais: WhatsApp como cartão principal em gradiente; Telefone e E-mail em cartões brancos com botão de copiar. “Qual setor procurar?” leva cada necessidade ao autoatendimento ou ao setor certo (âncoras `#setor-<id>`). Contatos em dois grupos com rótulo dourado: Setores (com o assunto de cada um) e Diretoria (com o responsável); cada linha tem ícone próprio, e-mail e telefone visíveis e ações de 44px (E-mail, copiar, Ligar, WhatsApp em verde). Locais: Sede (Maceió) e Seccional (Arapiraca) com endereço, copiar, Google Maps e Waze; sem mapa incorporado (LGPD e peso). Telefones sempre no formato `(82) 9XXXX-XXXX`.

## Ouvidoria

Ordem: aviso “Antes de registrar” (fundo #FBF7EC com borda dourada; Ouvidoria como segunda instância, atalhos para Requerimentos, Fale Conosco e e-SIC), “Como funciona” em 4 passos (cards com número grande em cinza no desktop; lista compacta numerada no celular), tipos de manifestação (5 colunas no desktop, lista com ícone à esquerda no celular, selos “Procure o setor antes” e “Pode ser anônima”) com um único botão “Registrar no portal”, privacidade em faixa de 3 itens com e-mail e botão de copiar, FAQ em cartão com barra dourada na pergunta aberta e fechamento em gradiente com e-mail e telefone. Cabeçalho com “Registrar manifestação” e “Acompanhar protocolo”. Links: e-OUV `#ouv/home`, e-SIC `#sic/home` no Portal da Transparência (mesmo cadastro; denúncia anônima pelo botão “sem login” do portal).

## Liquid glass

Vidro só em elementos que ficam sobre conteúdo. Utilitários em `src/index.css`: `.glass-blue` (azul #003366 a 85%, brilho branco de 7% no topo, blur 20px e saturação 180%, filetes internos claros), `.glass-light` (branco a 80%, mesmo blur) e `.glass-chip` (azul-escuro a 55%, blur 12px, sombra suave). Sem suporte a `backdrop-filter` ou com `prefers-reduced-transparency`, todos viram superfícies sólidas. Uso: cabeçalho fixo após 8px de rolagem (celular: barra azul em vidro azul; desktop: barra da logo em vidro claro e barra do menu em vidro azul; no topo da página, cores sólidas), barras fixas de filtro (Requerimentos e Eventos, vidro claro com anel cinza e sombra difusa), selos sobre imagens (“Em destaque”, “Vídeo”, “Carrossel”) e setas do slider (vidro claro). Não usar em cards, painéis do menu, blocos de texto ou no lugar dos gradientes institucionais; no máximo dois ou três elementos de vidro visíveis ao mesmo tempo.

## Menu principal (desktop)

`src/config/navigation.ts` é a fonte única do menu (desktop, celular e busca). Cada seção tem colunas de links com ícone e descrição de uma linha, e um card de destaque à direita: Instituição → Portal da Transparência; Serviços → CRF AL em Casa; Fiscalização → e-mail e WhatsApp do setor; Imprensa → Assessoria de Comunicação. Transparência fica só na barra e no selo Acesso à Informação; Legislação fica em Fiscalização; Estatuto não aparece no menu.

Painel centralizado na barra (não no botão): 640px com uma coluna, 980px com duas, borda superior dourada em gradiente, cantos de 16px e sombra profunda. Colunas com títulos dourados (#8A6A12) e fio cinza; links com ícone em círculo, título azul-escuro e descrição em cinza, seta dourada que desliza no hover e seta diagonal nos links externos. Página atual: fundo azul-claro e ícone preenchido. Card de destaque em gradiente azul com fio dourado, rótulo dourado, título, texto e botões em pílula. Seção atual marcada com sublinhado dourado na barra azul. Abre com atraso de 90ms e fecha com 160ms de tolerância; clique alterna; Esc fecha e devolve o foco; `aria-expanded`/`aria-controls`; fecha ao trocar de página; véu azul a 25% sobre a página enquanto aberto; entrada com fade e leve deslize, desativada com movimento reduzido.

## Menu de navegação mobile

Gaveta com topo em gradiente azul, logo branca (link para a home) e fio dourado; título e descrição só para leitores de tela. Ordem: campo “Buscar páginas e serviços” (abre a busca do portal), atalhos Empresas/Farmacêuticos/Cidadão, lista principal em cartão branco, card CRF AL em Casa em gradiente e bloco de Acesso à Informação e redes sociais. A seção da página atual abre automaticamente e recebe um ponto dourado; a página atual tem fundo branco, ícone preenchido e barra dourada à esquerda. Títulos de grupo em dourado, ícones em círculo e setas diagonais nos links externos.

