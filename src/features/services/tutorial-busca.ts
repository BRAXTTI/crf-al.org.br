import type { Tutorial, TutorialPerfil } from '@/data/servicos';

export type Filtro = 'todos' | TutorialPerfil;

export function normalizar(texto: string) {
  return texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export const doPerfil = (t: Tutorial, filtro: Filtro) => filtro === 'todos' || t.perfil === filtro || t.perfil === 'ambos';

/** Busca por título, nome antigo, assunto e sinônimos; todas as palavras do termo precisam aparecer. */
export function combinaBusca(t: Tutorial, termo: string) {
  const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
  const texto = normalizar(`${t.titulo} ${t.title} ${t.category} ${t.sinonimos.join(' ')}`);
  return palavras.every((palavra) => texto.includes(palavra));
}
