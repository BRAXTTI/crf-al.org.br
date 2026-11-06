import type { ProporcaoVideo } from '@/data/tutoriais-guias';

/** Moldura das gravações 4:3 (Manual e Tutoriais); nos tutoriais narrados, usar `telaDe('16:9')`. */
export const TELA = 'aspect-4/3 overflow-hidden rounded-[18px] border border-crfal-gray-200 bg-crfal-gray-100 shadow-[0_16px_40px_-16px_rgba(0,51,102,0.28)] lg:shadow-[0_24px_60px_-16px_rgba(0,51,102,0.28)]';

const ASPECTO: Record<ProporcaoVideo, string> = {
  '4:3': 'aspect-4/3',
  '16:9': 'aspect-video',
  '9:16': 'aspect-[9/16]',
};

/** Mesma moldura, na proporção do arquivo: 16:9 e 9:16 não ganham faixas pretas. */
export function telaDe(proporcao: ProporcaoVideo = '4:3') {
  return TELA.replace('aspect-4/3', ASPECTO[proporcao] ?? ASPECTO['4:3']);
}
