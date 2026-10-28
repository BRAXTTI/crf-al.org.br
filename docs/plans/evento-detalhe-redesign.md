# Plano — redesenho da página de detalhe de evento

Rota: `/eventos/:slug` (`src/features/events/pages/EventoDetailPage.tsx`).
Data da análise: 27/10/2026. Base: branch `feat/evento-detalhe-redesign` em `08510e4`.
Escopo: somente frontend. Não muda o WordPress, não cria serviço novo e não sai do plano gratuito da Cloudflare (detalhes na seção 10).

---

## 1. Fontes consultadas

| Fonte | O que foi visto |
|---|---|
| `EventoDetailPage.tsx`, `EventosPage.tsx`, `components/EventCards.tsx`, `utils.ts` | Layout atual, mapeamento `CRFEvent → Evento`, regras de status e de CTA |
| `src/services/wordpress/types.ts`, `client.ts`, `image-set.ts`, `event-hooks.ts` | `WPEventListing.event_details` (inclui `videoUrl`, `startTime`, `endTime`), `getPostImage` × `getPostImageSet` (srcset + width/height) |
| `functions/api/events.ts` → `functions/_content.ts` | Proxy com cache; `?slug=`, `?id=`, `?related=` e **`?format=ics` (feed .ics de todos os eventos, já em produção)** |
| `src/lib/calendar.ts` | `eventsCalendar(events, siteUrl)`: gerador .ics puro (RFC 5545, quebra de linha por octetos), reutilizável no navegador |
| `src/lib/youtube.ts`, `features/services/components/TutorialDetail.tsx` | `getYouTubeEmbedUrl` (youtube-nocookie) e padrão de *facade* "clique para carregar" o player |
| `src/lib/maceio.ts` | `weekday()`, `formatDate()`, fuso `America/Maceio`, hook que atualiza status a cada minuto |
| `src/components/block/page-hero.tsx` | `PageHero` (props `actions`, `aside`, `meta`, `section`) e `PageHeroAction` (botões primário branco / secundário vazado, com "(abre em uma nova aba)") |
| `src/index.css` (`@theme`) | Tokens: `crfal-blue #003366`, `crfal-blue-dark #0b192c`, `crfal-gold #c59b27`, cinzas, `font-display`, `shadow-card`, `section-panel`, fundo do site `#e8f1fb` |
| `public/_headers` e `functions/_middleware.ts` | CSP: `frame-src https://www.youtube-nocookie.com` já liberado; `img-src` **não** inclui `i.ytimg.com` |
| `docs/plenarias.md` | Precedente de UI da casa: destaque com contagem, links "Assistir", "ausência de link não gera botão fictício" |
| Produção (Playwright 1.64, 1280×900 e 390×844 @2x) | Medições abaixo; prints em `/tmp/ev-detalhe-desk.png`, `/tmp/ev-detalhe-mob.png`, `/tmp/ev-detalhe-desk-dobra2.png`, `/tmp/ev-lista-desk.png`, `/tmp/ev-lista-mob.png` (anteriores: `/workspace/ev-detalhe.png`, `/workspace/ev-lista.png`) |
| `GET /api/events` em produção | **Existe só 1 evento publicado**: `farmacia-popular-sem-misterios` (id 16779), 28/10/2026 19:00–21:00, online, `videoUrl` YouTube, `registrationUrl` vazio, público "Farmacêuticos", capa 1672×941 (tamanhos WP: 300, 768, 1024, 1536, full; `alt_text` vazio) |

**Não existem hoje eventos sem capa, encerrados, cancelados, presenciais, híbridos ou de vários dias.** Esses estados só podem ser verificados com variações do payload real feitas **no navegador de teste** (interceptação de rede do Playwright, seção 9). Nada disso vai para o repositório nem para o WordPress, e nenhum dado aparece em produção.

---

## 2. Diagnóstico

### 2.1 Capa cortada (problema principal)
- `<img class="w-full h-auto object-cover max-h-[420px]">` dentro de um contêiner da largura total.
- **Desktop 1280:** a área exibida tem 1214×420 px. Na proporção natural (1672×941) ela teria **683 px** de altura, então **263 px (38%) são cortados**, cerca de 131 px em cima e 131 px embaixo. No print, o "FARMÁCIA" do título da arte está decepado e a faixa do palestrante e o logo CRF-AL somem (`/tmp/ev-detalhe-desk-dobra2.png`).
- **Mobile 390:** 356×200, sem corte. O defeito só aparece a partir de ~750 px de largura, e por isso passa despercebido no celular.
- Usa `getPostImage` (só `source_url` full, 1672 px): o celular baixa a arte inteira para mostrar 356 px. Não há `srcset` nem `width/height` (sujeito a CLS), embora `getPostImageSet` já exista e seja usado nas notícias.
- `alt` = título do evento. A arte contém data, horário e canal, e o `alt_text` do WP está vazio.

### 2.2 `videoUrl` praticamente invisível
- `mapEvent` (`utils.ts:131`) mapeia só `registrationUrl` para `link`. `Evento` não tem campo de vídeo.
- A página lê `eventoCompleto.event_details.videoUrl` direto e **só mostra "Assistir transmissão" quando `status === 'em-andamento'`** (`EventoDetailPage.tsx:304`). Durante toda a divulgação (em breve) e depois do evento (gravação), o link não aparece.
- Sem `registrationUrl`, o cartão mostra **"Inscrições em breve."**: é uma promessa que o dado não sustenta, já que a live do YouTube pode nem ter inscrição. Hoje o único evento real não tem nenhum botão.
- O texto do botão fica fora do padrão pedido ("Assistir ao vivo" / "Assistir gravação").

### 2.3 Hierarquia e informação
- Hero: data abreviada ("28 de out de 2026"), **sem horário**, sem dia da semana, sem fuso. O horário só aparece no cartão lateral, formatado como "· 19:00".
- O cartão não tem linha de **Horário** (início–fim), nem **Modalidade** e **Status** em texto. O rótulo "Início" é ambíguo para evento de um dia só.
- O status "Cancelado" gera dois chips redundantes ("Cancelado" + "Não será realizado").
- Não usa a contagem "É hoje!/Amanhã/Em N dias" (`rotuloContagem`), que já existe na lista.
- Os títulos são inconsistentes: "Sobre o evento" usa `font-display text-2xl semibold`, e "Informações do evento" usa `text-lg font-bold` sem `font-display`.

### 2.4 Ordem, ritmo e mobile
- **Mobile:** hero (64–415) → capa (456–656) → "Sobre o evento" (697) → texto longo → **cartão de informações só em y≈1439**. Data, horário e ação ficam abaixo de quase dois scrolls, depois de um texto que repete as mesmas informações com emojis.
- **Desktop:** a capa ocupa a largura toda (1214 px) e empurra o conteúdo, e o cartão começa em y≈960. Os espaçamentos são irregulares: hero→capa 65 px, capa→conteúdo 40 px, conteúdo→"Voltar" ~75 px.
- O corpo do texto vai direto sobre o fundo azul-claro do site, sem superfície. A linha chega a ~95 caracteres no desktop, acima do confortável (60–75).

### 2.5 Acessibilidade (medido)
| Elemento | Cor | Contraste em branco | Em `#e8f1fb` | WCAG AA (4,5:1) |
|---|---|---|---|---|
| Rótulos do cartão ("INÍCIO", "TRANSMISSÃO") | `crfal-gray-400 #9ba8b8` | **2,42:1** | — | ❌ |
| "Inscrições em breve." | `crfal-gray-500 #8a9bb0` | **2,84:1** | — | ❌ |
| Corpo da descrição | `crfal-gray-600 #566579` | 5,94:1 | 5,21:1 | ✅ |
- Pares rótulo/valor em `<p>` soltos, sem `<dl>/<dt>/<dd>`. Datas sem `<time datetime>`.
- O link "Inscreva-se" abre em nova aba sem aviso para leitor de tela. O `PageHeroAction` já resolve isso.

### 2.6 Bugs de lógica encontrados no caminho
- `derivarStatus` (`utils.ts:96`): sem `endDate`, o evento vira **"Encerrado" no minuto em que começa** (`fim === null` → cai em `inicio !== null → 'encerrado'`). Uma live sem término cadastrado mostraria "Assistir gravação" durante a transmissão.
- O status é calculado uma única vez, na renderização. Com a página aberta, "Em breve" não vira "Em andamento".
- Feed `.ics` (`src/lib/calendar.ts`): `DTSTAMP` recebe a data de início, mas pela RFC deveria ser o momento da geração. Não há `DESCRIPTION`. É um problema menor.

### 2.7 Lista `/eventos` (consistência; fora do núcleo)
- Com um único evento (o destaque) e nenhum filtro ativo, a página mostra **"Nenhum evento encontrado — Tente ajustar a busca ou os filtros"** com o botão "Limpar filtros" (`EventosPage.tsx:357`: `totalResultados` desconta o destaque). É um estado vazio falso, visível nos dois prints da lista.
- No desktop, a imagem do destaque fica em `aspect-auto min-h-[340px] object-cover` (607×383 vs 16:9) e corta as laterais da arte, inclusive o logo CRF-AL.
- O destaque usa `MapPin` para local mesmo em evento online. O card usa `Monitor` corretamente.
- O "Baixar calendário de eventos (.ics)" é um link sublinhado cru, fora do padrão de botões.
- No desktop, o campo de busca da barra de filtros fica espremido (~70 px).

---

## 3. Layout proposto

### 3.1 Estrutura (desktop ≥ 1024 px)

```
┌──────────────────────── PageHero (section="imprensa") ────────────────────────┐
│ Início › Eventos › Título                                                    │
│ — EVENTO                                                                       │
│ Farmácia Popular sem Mistérios (h1)                      [▶ Assistir ao vivo] │  ← actions (PageHeroAction)
│ (Em breve) (Online) (Amanhã)                             [+ Adicionar à agenda]│
│ 📅 Quarta-feira, 28 de outubro de 2026 · 19h às 21h (horário de Brasília)      │
│ 🖥 Canal do CRF-AL no YouTube                                                   │
│ Notícias | Publicações do CFF | Galeria | Eventos                               │
└────────────────────────────────────────────────────────────────────────────────┘
┌──────── col 1–8 (≈800 px) ────────┐ ┌──── col 9–12 (≈384 px, sticky) ────┐
│ <figure> capa SEM corte (16:9 →   │ │ Informações do evento              │
│ 800×450), largura/altura reais    │ │ Data · Horário · Modalidade ·       │
└───────────────────────────────────┘ │ Local/Transmissão · Público · Status│
┌───────────────────────────────────┐ │ ─────────────────────────────────── │
│ Sobre o evento (superfície branca,│ │ CTA primário + secundário           │
│ texto max-w-[68ch])               │ │ Adicionar à agenda (.ics)           │
└───────────────────────────────────┘ └─────────────────────────────────────┘
Outros eventos (cards EventoCard, grid 3)  ·  ← Voltar para a agenda
```

- Grid `lg:grid-cols-12 gap-8`. **Ordem no DOM: capa → cartão → descrição**. O cartão fica em `lg:col-start-9 lg:col-span-4 lg:row-span-2 lg:row-start-1 lg:self-start lg:sticky lg:top-(--header-offset)`; capa e descrição em `lg:col-span-8`. Assim a ordem de leitura do leitor de tela e a ordem do mobile são a mesma, sem `order-*`.
- A largura de ≈800 px vem das contas do contêiner: `max-w-7xl` + `lg:px-8` = 1216 px úteis, 12 colunas de 72 px com gap de 32. Uma arte 16:9 fica com 450 px de altura. Fica inteira e sem dominar a página.

### 3.2 Hero
- Mantém o `PageHero` (breadcrumb, eyebrow "Evento", abas da seção Imprensa). É a mesma identidade da lista e das demais páginas internas.
- Em `children`: linha de chips (status, modalidade, contagem `rotuloContagem` quando houver) e **até duas linhas de fatos**: data por extenso com dia da semana + horário com fuso, e local/canal.
- Em `actions`: CTAs com `PageHeroAction` (primário branco, secundário vazado), regras na seção 5. O próprio `PageHero` já os põe à direita no desktop e logo abaixo dos fatos no mobile, ou seja, na **primeira dobra** nos dois tamanhos.
- Retirar o chip "Não será realizado". O cancelamento ganha um aviso próprio (3.6).

### 3.3 Capa sem corte
- Fonte: `getPostImageSet(eventoCompleto)` → `src`, `srcSet`, `width`, `height`, `alt`.
- Marcação:
  ```tsx
  <figure className="overflow-hidden rounded-2xl border border-crfal-gray-200 bg-crfal-gray-100 shadow-card">
    <img src srcSet sizes="(min-width: 1024px) 800px, calc(100vw - 32px)"
         width={w} height={h} alt={…} decoding="async" fetchPriority="high"
         className="mx-auto block h-auto w-auto max-w-full max-h-[min(75vh,720px)]" />
  </figure>
  ```
- **Proibido `object-cover` na capa do detalhe.** A proporção vem dos atributos `width`/`height`, o que também evita CLS. Para arte retrato (ex.: 1080×1350 de Instagram), o `max-h` limita a altura e a imagem fica centralizada sobre o fundo neutro (`bg-crfal-gray-100`), sem cortar nada. É o mesmo efeito de `object-contain` com fundo, sem precisar de altura fixa.
- `alt`: usar `alt_text` do WP quando houver; senão, `Arte de divulgação do evento «título»`. Tudo o que a arte informa precisa estar também em texto no cartão.
- Opcional: link discreto "Ver arte em tamanho original" (`source_url` full, nova aba). Decisão pendente D4.

### 3.4 Cartão "Informações do evento"
Lista de definição `<dl>` (ícone `aria-hidden` + `<dt>` + `<dd>`), rótulo em `text-crfal-gray-600` (5,94:1), valor em `text-neutral-800`:

| Linha | Regra | Exemplo (evento real) |
|---|---|---|
| **Data** | Um dia: `weekday` + data por extenso. Vários dias: intervalo `formatarData` por extenso | Quarta-feira, 28 de outubro de 2026 |
| **Horário** | `startTime`–`endTime` no formato pt-BR "19h", "19h30". Sem fim: "A partir das 19h". Vários dias: "Início 7/9 às 9h · término 10/9 às 18h". Sempre com o sufixo "horário de Brasília" (Maceió = UTC−3, sem horário de verão) e `<time dateTime="2026-10-28T19:00-03:00">` | 19h às 21h (horário de Brasília) |
| **Modalidade** | `MODALIDADE_LABELS` + ícone | Online |
| **Local** / **Transmissão** | Presencial: "Local". Online: "Transmissão". Híbrido: as duas linhas se houver dado (só `location`, nunca inventar a segunda) | Canal do CRF-AL no YouTube |
| **Público** | `publico`, se houver | Farmacêuticos |
| **Situação** | Chip `STATUS_COLORS` + frase curta: "Ao vivo agora" (em andamento), "Realizado em 28/10/2026" (encerrado), "Cancelado" | Em breve · Amanhã |

Rodapé do cartão: CTAs repetidos **apenas no desktop** (`hidden lg:flex`), porque o cartão é sticky e acompanha a leitura. No mobile, os CTAs do hero já estão na primeira dobra e não há duplicação de leitura em telas pequenas. Ver D2.

### 3.5 Descrição ("Sobre o evento")
- Superfície branca `rounded-2xl border border-crfal-gray-200 bg-white p-6 md:p-8 shadow-card`, a mesma linguagem dos cards da lista.
- Texto `max-w-[68ch] text-base md:text-[17px] leading-relaxed text-crfal-gray-700`, `strong` em `text-neutral-800`. Os seletores `[&_…]` atuais continuam, com o espaçamento de `h2/h3` ajustado.
- O conteúdo do WP (que já repete data e horário com emojis) **não é alterado**.

### 3.6 Avisos de estado (acima da capa, largura das 8 colunas)
- **Cancelado:** caixa `border-red-200 bg-red-50 text-red-700` com ícone `Ban` e o texto "Este evento foi cancelado e não será realizado." O título no h1 **não** recebe `line-through`, para preservar a leitura.
- **Encerrado:** faixa neutra `bg-crfal-gray-100 text-crfal-gray-700` com "Este evento já foi realizado em 28 de outubro de 2026." + "Assistir gravação" se houver vídeo.

### 3.7 Ritmo vertical (tokens únicos para a página)
| Uso | Mobile | Desktop |
|---|---|---|
| Hero → primeiro bloco | `pt-6` | `pt-10` |
| Entre blocos da coluna principal (aviso, capa, descrição) | `space-y-6` | `space-y-8` |
| Padding de superfícies (cartão, descrição) | `p-5` | `p-6 / md:p-8` |
| Entre linhas do `<dl>` | `gap-4` | `gap-4` |
| Conteúdo → "Outros eventos" | `mt-12` | `mt-16` |
| "Outros eventos" → "Voltar" | `mt-8` | `mt-10` |
| Fim da página → rodapé | `pb-12` | `pb-16` |

### 3.8 Mobile (390 px)
Ordem: hero (chips, fatos com horário, **CTAs**) → aviso de estado → capa (356×200, inteira) → cartão (sem CTAs duplicados) → descrição → outros eventos → voltar.
Meta: na primeira tela (844 px) aparecem título, data, horário e o botão principal. O cartão começa antes de y≈1000 (hoje, 1439).
Botões com `min-h-11` (44 px) e largura total no mobile (`w-full sm:w-auto`).

### 3.9 "Outros eventos"
Trocar a lista de linhas própria por `EventoCard` em `grid gap-6 sm:grid-cols-2 xl:grid-cols-3` (máx. 3, como já vem de `?related=`). Fica idêntico à lista, sem estilo novo. Se não houver nenhum, a seção não aparece, como hoje.

---

## 4. Modelo de dados (`utils.ts`)

Acréscimos em `Evento` (opcionais e retrocompatíveis com `EventosPage` e `EventCards`):
```ts
video?: string;          // event_details.videoUrl, só http(s)
horaInicio?: string;     // "19:00" (de startDate; startTime do WP como fallback)
horaFim?: string;        // "21:00"
capa?: ImageSet;         // só o detalhe preenche (getPostImageSet)
```
- `link` continua sendo `registrationUrl`, sem renomear. Assim a lista não quebra.
- Validação de URL: aceitar só `https?://`. Caso contrário, `undefined`: não gera botão fictício, como já é a regra das Plenárias.
- `paraCRFEvent` passa a carregar `videoUrl` (já carrega) e o detalhe monta a `capa` com `getPostImageSet`.
- Funções novas e puras: `formatarHorario(inicio, fim?)`, `formatarDataExtenso(data, dataFim?)`, `acoesDoEvento(evento, agora)` (seção 5).

---

## 5. Regras de CTA (`acoesDoEvento`)

| Status \ dados | `video` | `link` (inscrição) | Agenda (.ics) |
|---|---|---|---|
| **Em breve** | Secundário "Assistir ao vivo" + dica "A transmissão começa às 19h" | **Primário "Inscreva-se"** | Terciário "Adicionar à agenda" |
| Em breve, só vídeo | **Primário "Assistir ao vivo"** | — | Secundário "Adicionar à agenda" |
| **Em andamento** | **Primário "Assistir ao vivo"** + selo "Ao vivo agora" (ponto pulsante `motion-safe`) | Secundário "Inscreva-se" | — |
| **Encerrado** | **Primário "Assistir gravação"** (D1) | — | — |
| **Cancelado** | — | — | — |
| Sem nenhum dado | Nenhum botão e **nenhuma frase do tipo "Inscrições em breve"** (D3) | | |

- Ícones: `PlayCircle` (vídeo), `ExternalLink`/`ArrowUpRight` (inscrição, já no `PageHeroAction`), `CalendarPlus` (agenda).
- Link externo: `target="_blank" rel="noopener noreferrer"` + "(abre em uma nova aba)" em `sr-only`, que o `PageHeroAction` já faz.
- **Player embutido (opcional, D5):** quando `getYouTubeEmbedUrl(video)` reconhecer o vídeo e o status for *em andamento* ou *encerrado*, mostrar uma seção "Transmissão"/"Gravação" com *facade* clicável (padrão de `TutorialDetail.tsx`). Usar a **capa do evento** como pôster, e não a miniatura do YouTube: `i.ytimg.com` não está no `img-src` da CSP, enquanto `youtube-nocookie.com` já está em `frame-src`. **Nenhuma mudança de CSP.**

### Adicionar à agenda
- **Gerado no cliente**, sem requisição nova: `eventsCalendar([crfEvent], SITE_URL)` (já existe em `src/lib/calendar.ts`, é puro e já é usado pela Function) → `Blob('text/calendar')` → `<a download="slug.ics">`. Custo zero de Functions.
- Alternativa sem código novo de geração: o feed `/api/events?format=ics` já existe, mas traz **todos** os eventos. Serve para a lista e não para o detalhe.
- Opcional (D6): link "Google Agenda" (`https://calendar.google.com/calendar/render?action=TEMPLATE&text=…&dates=…/…&details=…&location=…`), só uma URL, sem API nem chave.

---

## 6. Estados a cobrir

| Estado | Comportamento |
|---|---|
| **Sem capa** | Sem `<figure>` e sem placeholder falso (D7). A descrição sobe para o topo da coluna. O hero carrega a identidade |
| **Online** | "Transmissão: …". Ícone `Monitor`. CTA de vídeo conforme a seção 5 |
| **Presencial** | "Local: …". Ícone `MapPin`. Opcional (D8): link "Ver no mapa" (`https://www.google.com/maps/search/?api=1&query=<local>`), só URL |
| **Híbrido** | Linha "Local" + "Transmissão" se houver `video`. Nunca preencher um local que não veio do WP |
| **Em andamento** | Chip verde "Em andamento" + "Ao vivo agora". Status recalculado a cada minuto (hook no estilo `useStatusAtendimento`) |
| **Encerrado** | Faixa neutra (3.6), chip cinza, só "Assistir gravação" se houver vídeo. Agenda e inscrição somem |
| **Cancelado** | Aviso vermelho (3.6), chip "Cancelado", nenhum CTA. Capa com `opacity-80`? (D9) |
| **Vários dias** | Data "7 a 10 de setembro de 2026". Horário "Início 7/9 às 9h · término 10/9 às 18h" (sem inventar "diariamente") |
| **Sem horário de término** | "A partir das 19h". Status: em andamento até 23h59 do dia de início em Maceió (D10, corrige o bug 2.6) |
| **Carregando / erro / 404** | Mantém os atuais. O skeleton passa a imitar o novo layout (bloco 16:9 + cartão), para não haver salto |

---

## 7. Acessibilidade (checklist que cada tarefa respeita)
- Contraste ≥ 4,5:1 em todo o texto: rótulos em `crfal-gray-600`, nunca `-400/-500` sobre branco.
- `<dl>` no cartão, `<time dateTime>` em datas, `<figure>` na capa, h1 → h2 em ordem ("Sobre o evento", "Informações do evento", "Outros eventos").
- Ordem do DOM igual à ordem visual no mobile. No desktop o cartão vem logo após a capa, uma sequência aceitável.
- Foco visível em todos os links/botões (`focus-visible:ring-2`). Alvos de toque com `min-h-11`.
- Ícones decorativos com `aria-hidden`. Pulsação só com `motion-safe:`.
- `alt` da capa definido (3.3). O player do YouTube com `title="Transmissão: «título»"`.
- Verificação com axe-core via Playwright (já usado em `docs/plenarias.md`): **0 violações** na página nos dois tamanhos.

---

## 8. Tarefas (1 tarefa = 1 commit)

Ordem recomendada: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8. As tarefas 1, 2, 3 e 5 não dependem umas das outras. A 4 (layout) só move blocos, e as que vierem depois dela entram nos espaços já definidos. Todas mexem em `EventoDetailPage.tsx`, então convém fazê-las em sequência para evitar conflito, não em paralelo.
Cada tarefa termina com `npm run lint`, `npm run typecheck` e `npm test` verdes, e o build dentro do orçamento de 400 KiB (`check-performance.mjs`).

### Tarefa 1 — Capa sem corte, com srcset e dimensões reais
- **Arquivos:** `src/features/events/pages/EventoDetailPage.tsx`
- **O que fazer:** trocar o `<img>` atual por `<figure>` + `<img>` conforme 3.3, alimentado por `getPostImageSet(eventoCompleto)`. Remover `object-cover`/`max-h-[420px]`. Definir `alt` com fallback. Manter `getPostImage` só para o `SEO`/og:image.
- **Aceite (browser):**
  1. 1280×900, evento real: `img.getBoundingClientRect()` → `|largura/altura − 1672/941| < 0,01` e nenhum `object-fit: cover` computado. No print, "FARMÁCIA" (topo da arte) e o logo CRF-AL (canto inferior direito) aparecem inteiros.
  2. 390×844 @2x: `img.currentSrc` termina em `-768x432.jpg` ou `-1024x576.jpg`, e não no arquivo full de 1672 px.
  3. `img` tem `width`/`height`. O Lighthouse/PerformanceObserver não aponta CLS da capa (> 0,01).
  4. Fixture "retrato" (seção 9, V8): imagem 1080×1350 aparece inteira, altura ≤ `min(75vh,720px)`, centralizada sobre fundo cinza, sem corte.

### Tarefa 2 — Mapear vídeo e reescrever as regras de CTA
- **Arquivos:** `src/features/events/utils.ts`, `src/features/events/pages/EventoDetailPage.tsx`
- **O que fazer:** `Evento.video` + validação http(s) no `mapEvent`. Criar a função pura `acoesDoEvento` com a tabela da seção 5. Renderizar no lugar do bloco atual do cartão (por enquanto no mesmo lugar, e a Tarefa 4 leva para o hero). Remover "Inscrições em breve." e as outras frases de fallback sem base nos dados.
- **Aceite (browser):**
  1. Evento real (em breve, só vídeo): existe exatamente um link "Assistir ao vivo" com `href="https://www.youtube.com/watch?v=fZ_O6wZzVNA"`, `target=_blank`, e o texto acessível contém "(abre em uma nova aba)". Não existe "Inscreva-se" e não aparece "Inscrições em breve".
  2. V7 (com `registrationUrl`): "Inscreva-se" é o primário e "Assistir ao vivo" o secundário.
  3. V6 (`page.clock` em 28/10/2026 19:30 −03:00): "Assistir ao vivo" primário + selo "Ao vivo agora".
  4. V3 (encerrado): só "Assistir gravação". V4 (cancelado): nenhum CTA.
  5. `/eventos` continua idêntica (o card ainda mostra "Inscrever-se" só quando há `link`).

### Tarefa 3 — Data, horário com fuso e cartão de informações em `<dl>`
- **Arquivos:** `src/features/events/utils.ts`, `src/features/events/pages/EventoDetailPage.tsx` (reutiliza `weekday`/`formatDate` de `src/lib/maceio.ts`)
- **O que fazer:** `formatarHorario`, `formatarDataExtenso` e as linhas Data/Horário/Modalidade/Local ou Transmissão/Público/Situação (3.4) em `<dl>`, com rótulos em `crfal-gray-600`, `<time dateTime>` e título "Informações do evento" em `font-display`, igual a "Sobre o evento". Hero: a linha de data passa a "Quarta-feira, 28 de outubro de 2026 · 19h às 21h (horário de Brasília)".
- **Aceite (browser):**
  1. Evento real: o cartão contém, nesta ordem, os `dt` "Data", "Horário", "Modalidade", "Transmissão", "Público", "Situação", e os `dd` "Quarta-feira, 28 de outubro de 2026", "19h às 21h (horário de Brasília)", "Online", "Canal do CRF-AL no YouTube", "Farmacêuticos", "Em breve…".
  2. `time[datetime="2026-10-28T19:00-03:00"]` existe.
  3. Com o navegador em `timezoneId: 'America/Sao_Paulo'` e em `'Europe/Lisbon'`, o texto exibido é o mesmo (o horário é sempre de Brasília).
  4. V5 (vários dias): "Data" mostra um intervalo e "Horário" mostra início e término com dia. Sem fim (V9): "A partir das 19h".
  5. axe-core: nenhuma violação `color-contrast` no cartão.

### Tarefa 4 — Novo layout em grid, hero com CTAs e ordem mobile
- **Arquivos:** `src/features/events/pages/EventoDetailPage.tsx`
- **O que fazer:** grid 12 colunas com ordem DOM capa → cartão → descrição (3.1). Cartão sticky. CTAs no `actions` do `PageHero` usando `PageHeroAction`, repetidos no cartão só com `hidden lg:flex`. Chips no hero com `rotuloContagem`. Retirar o chip "Não será realizado". Descrição em superfície branca com `max-w-[68ch]`. Espaçamentos da tabela 3.7. Skeleton no formato novo.
- **Aceite (browser):**
  1. 1280: capa com largura entre 780 e 820 px. O cartão começa na mesma altura (±4 px) da capa, à direita, e continua visível (`position: sticky`) ao rolar até o fim da descrição.
  2. 390: o botão "Assistir ao vivo" fica inteiro dentro de y < 844 (primeira tela). O topo do cartão fica em y < 1000. Nenhuma rolagem horizontal (`scrollWidth === 390`).
  3. Leitor de tela (ordem do DOM): h1 → CTAs → capa → "Informações do evento" → "Sobre o evento" → "Outros eventos".
  4. Largura das linhas da descrição ≤ 68ch (`getComputedStyle(p).maxWidth`).
  5. Print comparativo antes/depois salvo em `/tmp/ev-detalhe-novo-{desk,mob}.png`.

### Tarefa 5 — "Adicionar à agenda" (.ics gerado no cliente)
- **Arquivos:** `src/features/events/pages/EventoDetailPage.tsx` (ou um componente pequeno `src/features/events/components/AdicionarAgenda.tsx`), `src/lib/calendar.ts` (só se a correção do `DTSTAMP` for aprovada, D11, com teste em `scripts/test-content-api.mjs`)
- **O que fazer:** botão que gera `eventsCalendar([evento], SITE_URL)` → Blob → download `«slug».ics`. Só aparece em *em breve*. Nenhuma chamada de rede nova.
- **Aceite (browser):**
  1. Clicar dispara `download` com nome `farmacia-popular-sem-misterios.ics`. O conteúdo tem `DTSTART:20261028T220000Z`, `DTEND:20261029T000000Z`, `SUMMARY:Farmácia Popular sem Mistérios` e `URL:` do próprio evento.
  2. Ao clicar, a aba Rede (Playwright `page.on('request')`) não registra nenhuma requisição.
  3. O arquivo importa no Google Agenda/Outlook e aparece às 19h de Brasília (verificação manual).
  4. V3/V4: o botão não aparece.

### Tarefa 6 — Estados: cancelado, encerrado, sem capa, presencial/híbrido, vários dias
- **Arquivos:** `src/features/events/pages/EventoDetailPage.tsx`, `src/features/events/utils.ts` (só se D10 for aprovada: status sem `endDate`)
- **O que fazer:** avisos da 3.6 e comportamentos da tabela 6. Status recalculado a cada 60 s com `setInterval` em hook local, como em `src/lib/maceio.ts`.
- **Aceite (browser), um print por variante em `/tmp/ev-estado-*.png`:**
  1. V1 sem capa: nenhum `<figure>`/`<img>` de capa, sem área vazia, e a descrição alinhada ao topo do cartão.
  2. V2 presencial: rótulo "Local", ícone de pino, sem "Transmissão".
  3. V3 encerrado: faixa "Este evento já foi realizado em …", chip "Encerrado", sem inscrição/agenda.
  4. V4 cancelado: aviso vermelho com texto, h1 sem `line-through`, sem CTAs. O axe não aponta problema de contraste no aviso.
  5. V5 vários dias: intervalo correto no hero e no cartão.
  6. V6 em andamento: com `page.clock` avançando de 18:59 para 19:01, o chip muda de "Em breve" para "Em andamento" sem recarregar a página (≤ 60 s de relógio simulado).

### Tarefa 7 — "Outros eventos" com `EventoCard`
- **Arquivos:** `src/features/events/pages/EventoDetailPage.tsx`
- **O que fazer:** trocar as linhas próprias pelo grid de `EventoCard` (3.9).
- **Aceite (browser):** com V10 (`?related=` interceptado para devolver 2 variações do evento real com outros ids/slugs), aparecem 2 cards idênticos visualmente aos de `/eventos`, com a mesma classe raiz do `article`, e cada um leva ao slug correto. Com a lista vazia (o caso real de hoje), a seção não é renderizada.

### Tarefa 8 (opcional, D5) — Player embutido com facade
- **Arquivos:** `src/features/events/pages/EventoDetailPage.tsx` (pode extrair um componente `PlayerEvento.tsx` em `components/`)
- **O que fazer:** seção "Transmissão"/"Gravação" (em andamento/encerrado) com botão-pôster (capa do evento ou gradiente da marca) que só cria o `<iframe>` youtube-nocookie depois do clique.
- **Aceite (browser):** antes do clique, `document.querySelectorAll('iframe').length === 0` e nenhuma requisição a `youtube`. Depois do clique, um iframe `https://www.youtube-nocookie.com/embed/fZ_O6wZzVNA?…&autoplay=1` com `title`. O console fica sem erro de CSP. Funciona só pelo teclado (Tab + Enter).

### Tarefas da lista `/eventos` (consistência; opcionais e independentes)
- **L1 — Estado vazio falso.** `EventosPage.tsx`: na landing (`emLanding`), não mostrar "Nenhum evento encontrado" quando o destaque existe. *Aceite:* hoje, com o evento real, `/eventos` não contém o texto "Nenhum evento encontrado" e nem o botão "Limpar filtros". Com busca "xyz", o estado vazio aparece.
- **L2 — Ícone e imagem do destaque.** `EventosPage.tsx`: ícone `Monitor` para online, e a imagem do destaque em `md:aspect-video` (sem `aspect-auto min-h-[340px]`), para não cortar as laterais. *Aceite:* em 1280, a imagem do destaque tem proporção 16:9 ±1% e o logo CRF-AL da arte aparece inteiro. O ícone do local é o de monitor.
- **L3 — Botão do feed .ics.** `EventosPage.tsx`: estilizar "Baixar calendário de eventos (.ics)" como botão secundário (borda `crfal-blue`, `rounded-full`, ícone `CalendarPlus`, `min-h-11`). *Aceite:* visual igual ao "Ver detalhes" do destaque. O `href` continua `/api/events?format=ics`.
- **L4 — Busca espremida.** `EventosPage.tsx`: dar `lg:min-w-56` ao campo de busca. *Aceite:* em 1280, o input tem ≥ 224 px de largura e o placeholder "Buscar evento..." aparece inteiro.

### Tarefa opcional S1 (D12) — JSON-LD de evento mais completo
- **Arquivos:** `functions/_middleware.ts`
- **O que fazer:** acrescentar `eventStatus` (`EventScheduled`/`EventCancelled`), `eventAttendanceMode` (Online/Offline/Mixed), `VirtualLocation` com `videoUrl` e `startDate`/`endDate` com fuso `-03:00`, usando o mesmo fetch que o middleware já faz (zero requisições a mais).
- **Aceite:** `curl -s https://<preview>/eventos/farmacia-popular-sem-misterios | grep -o '"eventAttendanceMode":"[^"]*"'` → `OnlineEventAttendanceMode`. O Rich Results Test valida o `Event` sem erros. `npm run test:metadata` verde.

---

## 9. Como verificar no navegador (sem inventar dados)

- Rodar `npm run dev`. O Vite já roteia `/api/events` para `contentApi` com o WordPress real (`vite.config.ts`).
- Script Playwright **fora do repositório** (ex.: `/tmp/ev-check.mjs`, importando `/tmp/pw/node_modules/playwright/index.mjs`), em 1280×900 e 390×844 @2x, prints em `/tmp`.
- Variações são feitas **interceptando a resposta real** (`page.route('**/api/events?slug=*', r => r.fetch().then(…))`) e alterando só os campos abaixo, com textos marcados como teste. Nada é gravado em arquivo do projeto nem no WP:

| Id | Alteração sobre o payload real |
|---|---|
| V1 | remove `_embedded['wp:featuredmedia']` |
| V2 | `online:false`, `modalidade:'presencial'`, `location:'[TESTE] Local fictício'`, `videoUrl:''` |
| V3 | `status:'expired'` |
| V4 | `cancelled:true` |
| V5 | `endDate:'2026-10-30 21:00:00'` |
| V6 | sem alteração; `page.clock.setFixedTime(new Date('2026-10-28T19:30:00-03:00'))` |
| V7 | `registrationUrl:'https://example.org/teste-inscricao'` |
| V8 | `media_details` 1080×1350 + `page.route` da URL da imagem devolvendo um SVG 1080×1350 |
| V9 | `endDate:''`, `endTime:''` |
| V10 | `?related=` devolve 2 cópias com `id`/`slug` alterados (`[teste]`) |

- Acessibilidade: injetar axe-core (`npx axe` ou `@axe-core/playwright` instalado em `/tmp/pw`) e exigir 0 violações em cada variante.
- Depois do deploy de preview no Pages, repetir os aceites das Tarefas 1–4 contra a URL de preview com o evento real.

---

## 10. Plano gratuito da Cloudflare

- **Nenhum recurso novo:** sem KV, D1, R2, Queues, Durable Objects, Images/Image Resizing (pago) ou Workers pagos. As imagens responsivas usam os tamanhos que o **WordPress já gera** (`srcset`).
- **Nenhuma requisição nova a Functions:** o detalhe continua com `?slug=` + `?related=`. O .ics por evento é gerado no navegador. O player só carrega o domínio do YouTube depois do clique. Os links de Google Agenda e Maps são URLs simples.
- **CSP inalterada:** o pôster do player usa a capa do evento (domínio WP já liberado), e não `i.ytimg.com`.
- **JS/CSS:** acréscimo estimado < 3 KiB gzip (componentes + funções). `eventsCalendar` passa a entrar no bundle do cliente (~1 KiB). Tudo bem abaixo do orçamento de 400 KiB.
- A S1 (JSON-LD) usa o fetch que o middleware já faz, sem chamada extra.

---

## 11. Fora de escopo
- Editar conteúdo, campos ou o plugin no WordPress (inclusive preencher `alt_text` das capas, o que fica recomendado à equipe de comunicação).
- Trocar o `PageHero` por um hero novo ou mudar a paleta/tipografia da marca.
- Converter o horário para o fuso do visitante (ver D13).

---

## Decisões pendentes do usuário

1. **D1 — "Assistir gravação" depois do evento:** usar o mesmo `videoUrl` da live, assumindo que o YouTube mantém a gravação, ou exigir confirmação editorial (ex.: só exibir se o evento tiver um campo próprio de gravação no WP)?
2. **D2 — CTAs duplicados no desktop:** repetir os botões no cartão sticky (recomendado) ou deixá-los só no hero?
3. **D3 — Evento sem inscrição e sem vídeo:** não mostrar nada (recomendado, para não prometer o que o dado não diz) ou mostrar uma frase neutra? Qual texto, se for o caso?
4. **D4 — Link "Ver arte em tamanho original"** abaixo da capa: incluir?
5. **D5 — Player embutido (Tarefa 8):** fazer agora, depois ou nunca (só link para o YouTube)?
6. **D6 — Link "Google Agenda"** além do download .ics?
7. **D7 — Evento sem capa:** omitir a área (recomendado) ou mostrar o gradiente da marca usado nos cards (`BannerEvento`)?
8. **D8 — "Ver no mapa"** (link Google Maps) para eventos presenciais?
9. **D9 — Cancelado:** esmaecer a capa (`opacity-80`) ou mantê-la normal só com o aviso?
10. **D10 — Evento sem horário de término:** considerar "em andamento" até 23h59 do dia de início em Maceió? Isso corrige o bug 2.6 e também muda a lista.
11. **D11 — Corrigir o `DTSTAMP`** do .ics (data de geração em vez da de início) e incluir `DESCRIPTION` com o resumo? Afeta o feed já publicado.
12. **D12 — Tarefa S1** (JSON-LD `eventStatus`/`eventAttendanceMode`): incluir neste ciclo?
13. **D13 — Fuso do visitante:** basta "horário de Brasília" (recomendado) ou mostrar também a conversão para quem estiver fora de UTC−3?
14. **D14 — Tarefas L1–L4 da lista:** entram nesta branch ou ficam para uma branch própria?
15. **D15 — Rótulos de status:** padronizar "Em Breve/Em Andamento" (Title Case, hoje nos chips) para "Em breve/Em andamento" (como nos filtros)? Afeta cards e lista.
