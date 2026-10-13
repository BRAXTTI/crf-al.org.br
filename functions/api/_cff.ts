/**
 * Leitura das "Notícias do CFF" (Conselho Federal de Farmácia).
 * O site do CFF não oferece RSS nem API: a listagem em /noticias é HTML
 * renderizado no servidor, com 15 itens por página e categorias misturadas.
 * Percorremos as páginas em ordem e guardamos apenas a categoria
 * "noticias-do-cff". O resumo vem do og:description de cada matéria.
 * Usado pela Pages Function (/api/cff) e pelo middleware de dev do Vite.
 */

export interface CffNewsItem {
  link: string;
  title: string;
  image?: string;
  /** Data de publicação no formato AAAA-MM-DD (extraída da URL). */
  date?: string;
  summary?: string;
}

export interface CffNewsPage {
  items: CffNewsItem[];
  /** Página do CFF onde a próxima busca deve começar; null se acabou. */
  nextCursor: number | null;
}

export const CFF_BASE_URL = 'https://site.cff.org.br';
const CFF_CATEGORY_PATH = '/noticia/noticias-do-cff/';
const USER_AGENT = 'crfal-site/1.0 (+https://institucional.crf-al.org.br)';
/** Limite de páginas do CFF lidas por requisição (protege a origem). */
const MAX_SOURCE_PAGES = 6;

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}

const clean = (value: string) => decodeEntities(value.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

function absolute(url: string): string {
  try {
    return new URL(decodeEntities(url), CFF_BASE_URL).toString();
  } catch {
    return url;
  }
}

/** Extrai os cards da listagem e mantém só as Notícias do CFF. */
export function parseCffList(html: string): { items: CffNewsItem[]; total: number } {
  const items: CffNewsItem[] = [];
  const seen = new Set<string>();
  const blocks = html.split(/<div[^>]*class="[^"]*(?<![\w-])blog-two(?![\w-])[^"]*"/).slice(1);
  for (const block of blocks) {
    const anchor = block.match(/<h6[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i);
    if (!anchor) continue;
    const link = absolute(anchor[1]);
    if (!link.toLowerCase().includes(CFF_CATEGORY_PATH) || seen.has(link)) continue;
    seen.add(link);
    const image = block.match(/<img[^>]*\ssrc="([^"]+)"/i)?.[1];
    const dateMatch = link.match(/\/(\d{2})\/(\d{2})\/(\d{4})\//);
    items.push({
      link,
      title: clean(anchor[2]),
      image: image ? absolute(image) : undefined,
      date: dateMatch ? `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}` : undefined,
    });
  }
  return { items, total: blocks.length };
}

/** Resumo oficial da matéria (og:description ou description). */
export function parseSummary(html: string): string | undefined {
  const tag = html.match(/<meta[^>]*property="og:description"[^>]*>/i)?.[0];
  const content = tag?.match(/content="([^"]*)"/i)?.[1];
  const summary = content ? clean(content) : undefined;
  return summary && summary.length > 20 ? summary : undefined;
}

async function fetchText(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers: { 'user-agent': USER_AGENT, accept: 'text/html' } });
    if (!res.ok) throw new Error(`CFF respondeu HTTP ${res.status} para ${url}`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Reúne `limit` Notícias do CFF a partir da página `cursor` da listagem.
 * Busca os resumos em paralelo (falhas individuais não derrubam a lista).
 */
export async function getCffNews({ limit = 8, cursor = 1 }: { limit?: number; cursor?: number } = {}): Promise<CffNewsPage> {
  const items: CffNewsItem[] = [];
  let page = Math.max(1, Math.floor(cursor));
  let exhausted = false;
  for (let read = 0; read < MAX_SOURCE_PAGES && items.length < limit; read++, page++) {
    const html = await fetchText(`${CFF_BASE_URL}/noticias?page=${page}`, 10000);
    const parsed = parseCffList(html);
    if (parsed.total === 0) {
      exhausted = true;
      break;
    }
    for (const item of parsed.items) {
      if (items.length < limit && !items.some((existing) => existing.link === item.link)) items.push(item);
    }
  }
  if (items.length === 0 && !exhausted) throw new Error('CFF: nenhuma notícia da categoria encontrada');

  const queue = [...items];
  const workers = Array.from({ length: Math.min(4, queue.length) }, async () => {
    for (let item = queue.shift(); item; item = queue.shift()) {
      try {
        item.summary = parseSummary(await fetchText(item.link, 8000));
      } catch {
        /* sem resumo: o card mostra só o título */
      }
    }
  });
  await Promise.all(workers);

  return { items, nextCursor: exhausted ? null : page };
}
