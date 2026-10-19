# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Público principal, com o mesmo peso: **Farmacêuticos** (pessoa física, inscritos no Conselho) e **Empresas** (pessoa jurídica: farmácias, drogarias e demais estabelecimentos). Chegam com uma tarefa concreta — descobrir qual requerimento abrir, que documentos juntar, como fazer no CRF AL em Casa, quem procurar no Conselho — muitas vezes pelo celular. Quando as necessidades dos dois perfis disputam espaço, nenhum vence o outro: o portal oferece a escolha de perfil (parâmetro `perfil=pessoa-fisica|pessoa-juridica`).

Público secundário: **Cidadão** (Ouvidoria, informações sobre fiscalização e transparência) e imprensa/categoria acompanhando notícias, eventos e plenárias.

## Product Purpose

Portal institucional e central de serviços do Conselho Regional de Farmácia do Estado de Alagoas (CRF-AL), autarquia criada pela Lei nº 3.820/1960. Reúne orientações de requerimentos, tutoriais e manual do CRF AL em Casa, fiscalização, legislação, notícias, eventos, galeria, plenárias, diretoria, contato e ouvidoria.

Sucesso, como definido pelo encarregado do projeto: **imagem institucional** — o portal deve mostrar um Conselho moderno, presente, organizado e próximo da categoria. Autoatendimento, transparência e informação são meios para isso, não a métrica principal.

## Positioning

É a fonte oficial do CRF-AL: o único lugar que pode afirmar, com autoridade, como funcionam os requerimentos, prazos, setores, plenárias e a fiscalização em Alagoas. Os serviços transacionais ficam no sistema externo CRF AL em Casa; o portal orienta e encaminha para ele.

## Operating Context

- Usuários alternam entre o portal (orientação) e o CRF AL em Casa (sistema externo, aberto em nova aba).
- Atendimento presencial/remoto: seg. a sex., 9h–17h, horário de Maceió; canais WhatsApp, telefone e e-mail por setor.
- Ouvidoria é segunda instância: o usuário deve procurar o setor antes.
- Plenárias com transmissão no YouTube, pauta e ata assinada em PDF.
- Publicações do Conselho Federal de Farmácia (CFF) são apenas linkadas, nunca hospedadas.

## Capabilities and Constraints

- SPA em React 19 + Vite + TypeScript + Tailwind 4, roteada com React Router; Cloudflare Pages com Functions (`functions/`) para notícias, Instagram e publicações do CFF.
- Conteúdo dinâmico vem de WordPress headless (`wordpress.crf-al.org.br`): notícias, eventos, galerias (FooGallery), feed do Instagram (Smash Balloon).
- Conteúdo de serviços é código-fonte: `src/data/requerimentos.ts`, `src/data/servicos.ts`, `src/data/manual-crf-em-casa.ts`, `src/config/plenarias.ts`, `src/config/navigation.ts`, `src/config/service-profiles.ts`.
- Site migrado de WordPress: redirecionamentos e SEO (`migration/`, `docs/seo`, sitemaps) devem ser preservados.
- Todo o texto em português brasileiro; datas e horários no fuso de Maceió.
- Vocabulário fixo: “Farmacêuticos” / “Empresas” / “Cidadão”, “CRF AL em Casa”, “Requerimentos”, “Plenárias”, “Ata assinada”, “Pauta do dia”.

## Brand Commitments

- Nome: Conselho Regional de Farmácia do Estado de Alagoas, sigla CRF-AL; logo oficial e o símbolo da taça de Hígia.
- Identidade visual institucional existente (registrada em DESIGN.md) é a autoridade atual.

## Evidence on Hand

- Dados reais de requerimentos, tutoriais, manual com vídeos de demonstração (`public/images/manual-crf-em-casa/`), plenárias, diretoria com fotos e minicurrículos, setores e contatos.
- Notícias, eventos, galerias e Instagram reais via WordPress.
- Lista de conselheiros ainda vazia: mostrar “Composição em atualização”, nunca nomes fictícios.
- Não inventar: atas, pautas ou links inexistentes, estatísticas, depoimentos, números que ainda não carregaram (nunca exibir 0 ou —).

## Product Principles

1. **Oficial e verificável.** Cada informação é da fonte oficial; ausência de dado é declarada, nunca preenchida com placeholder fictício.
2. **Dois perfis, mesmo peso.** Farmacêuticos e Empresas encontram seu caminho com a mesma facilidade; o perfil escolhido acompanha a navegação.
3. **Orientar e encaminhar.** O portal explica e leva ao lugar certo (CRF AL em Casa, setor, Ouvidoria) em vez de duplicar o sistema.
4. **Modernidade com sobriedade.** A imagem de um Conselho atual vem de organização, clareza e acabamento — não de decoração que afaste o conteúdo.
5. **Privacidade por padrão.** Sem cookies de rastreamento, sem cadastro para navegar, preferências só no aparelho (LGPD).

## Accessibility & Inclusion

Conformidade WCAG 2.x nível AA: contraste AA (dourado como texto em branco usa #8A6A12), foco visível, navegação por teclado, link “Ir para o conteúdo”, respeito a `prefers-reduced-motion` e `prefers-reduced-transparency`, alvos de toque de 44px.
