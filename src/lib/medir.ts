import { limparTermo, type EventoTutorial } from '@/config/tutoriais-medicao';

/** Envia um evento ao contador anônimo. Nunca atrapalha a página: sem suporte ou com erro, não faz nada. */
export function medir(evento: EventoTutorial, dados: { tarefa?: string; passo?: number; termo?: string } = {}) {
  try {
    navigator.sendBeacon?.('/api/evento', new Blob([JSON.stringify({ evento, ...dados })], { type: 'application/json' }));
  } catch {
    // Medição é acessória.
  }
}

/** Busca sem resultado: o termo só sai do navegador se passar pela mesma limpeza da Function. */
export function medirBuscaVazia(termo: string) {
  medir('busca_vazia', { termo: limparTermo(termo) });
}

/** Conta início e 75% de um vídeo, uma vez cada. Criar um por vídeo aberto. */
export function medidorDeVideo(tarefa: string) {
  let iniciou = false;
  let chegou75 = false;
  return {
    aoTocar() {
      if (iniciou) return;
      iniciou = true;
      medir('video_inicio', { tarefa });
    },
    aoAvancar({ currentTime, duration }: HTMLVideoElement) {
      if (chegou75 || !(duration > 0) || currentTime / duration < 0.75) return;
      chegou75 = true;
      medir('video_75', { tarefa });
    },
  };
}
