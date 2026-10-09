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
