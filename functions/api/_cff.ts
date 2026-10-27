import { SITE_URL } from '../../src/config/site';
/**
 * Leitura das "Publicações do CFF" (Conselho Federal de Farmácia).
 * O site do CFF não oferece RSS nem API: /publicacoes é HTML renderizado no
 * servidor, com duas coleções por página (título em <h2>) e, em cada uma,
 * capas que apontam direto para o PDF. As capas não têm título em texto.
 * Os PDFs nunca são copiados: guardamos só o link para o arquivo no CFF.
 * Usado pela Pages Function (/api/cff-publicacoes) e pelo middleware de dev do Vite.
 */

export interface CffPublication {
  /** Endereço do PDF no site do CFF (aberto em nova aba, nunca hospedado aqui). */
  link: string;
  cover?: string;
  /** Número da edição, quando o link é de revista (ex.: Pharmacia Brasileira). */
  edition?: number;
}

export interface CffCollection {
  title: string;
  items: CffPublication[];
}

export const CFF_BASE_URL = 'https://site.cff.org.br';
const USER_AGENT = `crfal-site/1.0 (+${SITE_URL})`;
/** Limite de páginas do CFF lidas por atualização (protege a origem). */
const MAX_SOURCE_PAGES = 20;
const PARALLEL_PAGES = 4;

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

function absolute(url: string): string | undefined {
  try {
    const parsed = new URL(decodeEntities(url.trim()), CFF_BASE_URL);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function editionOf(link: string): number | undefined {
  const match = link.match(/\/revista\/pdf\/(\d+)\//) ?? link.match(/revista\.php\?id=(\d+)/);
  return match ? Number(match[1]) : undefined;
}

/** Extrai as coleções de uma página de /publicacoes. */
export function parseCffPublications(html: string): CffCollection[] {
  const collections: CffCollection[] = [];
  const sections = html.split(/<h2[^>]*class="[^"]*\bh3\b[^"]*"[^>]*>/).slice(1);
  for (const section of sections) {
    const title = clean(section.slice(0, section.indexOf('</h2>'))).replace(/ - /g, ' – ');
    if (!title) continue;
    const items: CffPublication[] = [];
    for (const thumb of section.split(/class="[^"]*\bteam-thumb\b/).slice(1)) {
      const href = thumb.match(/<a[^>]*\shref="([^"]+)"/i)?.[1];
      const link = href ? absolute(href) : undefined;
      if (!link || items.some((item) => item.link === link)) continue;
      const src = thumb.match(/<img[^>]*\ssrc="([^"]+)"/i)?.[1];
      items.push({ link, cover: src ? absolute(src) : undefined, edition: editionOf(link) });
    }
    if (items.length > 0) collections.push({ title, items });
  }
  return collections;
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
 * Percorre /publicacoes?page=N (em lotes paralelos) até a primeira página vazia
 * e devolve as coleções na ordem do CFF, juntando títulos repetidos.
 */
export async function getCffPublications(budgetMs = 20_000): Promise<CffCollection[]> {
  const deadline = Date.now() + Math.min(budgetMs, 20_000);
  const collections: CffCollection[] = [];
  for (let start = 1; start <= MAX_SOURCE_PAGES; start += PARALLEL_PAGES) {
    const remaining = deadline - Date.now();
    if (remaining <= 0) throw new DOMException('CFF: prazo total esgotado', 'TimeoutError');
    const pages = Array.from({ length: Math.min(PARALLEL_PAGES, MAX_SOURCE_PAGES - start + 1) }, (_, i) => start + i);
    const parsed = await Promise.all(pages.map(async (page) => parseCffPublications(await fetchText(`${CFF_BASE_URL}/publicacoes?page=${page}`, Math.min(10_000, remaining)))));
    let ended = false;
    for (const found of parsed) {
      if (found.length === 0) {
        ended = true;
        break;
      }
      for (const collection of found) {
        const existing = collections.find((c) => c.title.toLowerCase() === collection.title.toLowerCase());
        if (!existing) collections.push(collection);
        else for (const item of collection.items) if (!existing.items.some((i) => i.link === item.link)) existing.items.push(item);
      }
    }
    if (ended) break;
  }
  if (collections.length === 0) throw new Error('CFF: nenhuma publicação encontrada');
  return collections;
}
