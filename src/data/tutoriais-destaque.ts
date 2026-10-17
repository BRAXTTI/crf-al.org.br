import { tutoriais } from '@/data/servicos';

/**
 * Top 5 vídeos verticais (estilo reels) exibidos no topo da página de
 * Tutoriais, do mais recente para o mais antigo. Os arquivos ficam em
 * `public/images/tutoriais/`.
 */
export interface ReelDestaque {
  id: string;
  title: string;
  /** Linha curta abaixo do título no card. */
  subtitle: string;
  src: string;
  poster: string;
  duracao: string;
  /** Tutorial com o passo a passo deste vídeo, quando existir. */
  tutorialId?: string;
  /** Link alternativo quando não há tutorial correspondente. */
  href?: string;
  hrefLabel?: string;
}

function doTutorial(tutorialId: string, subtitle: string): ReelDestaque {
  const tutorial = tutoriais.find((t) => t.id === tutorialId);
  if (!tutorial?.motion) throw new Error(`Tutorial "${tutorialId}" sem vídeo em motion`);
  return { id: tutorialId, title: tutorial.title, subtitle, tutorialId, ...tutorial.motion };
}

export const REELS_DESTAQUE: ReelDestaque[] = [
  doTutorial('baixa-rt', 'Encerre o vínculo online'),
  doTutorial('situacao-protocolos', 'Acompanhe seus pedidos'),
  doTutorial('emitir-boletos', 'Sem precisar de login'),
  {
    id: 'sncr',
    title: 'Receita eletrônica de controlados',
    subtitle: 'O que muda com o SNCR',
    src: '/images/tutoriais/sncr.mp4',
    poster: '/images/tutoriais/sncr-poster.webp',
    duracao: '0:46',
  },
  {
    id: 'crf-em-casa',
    title: 'Conheça o CRF AL em Casa',
    subtitle: 'O atendimento online do Conselho',
    src: '/images/tutoriais/crf-em-casa.mp4',
    poster: '/images/tutoriais/crf-em-casa-poster.webp',
    duracao: '0:32',
    href: '/servicos/manual-crf-em-casa',
    hrefLabel: 'Abrir o manual',
  },
];
