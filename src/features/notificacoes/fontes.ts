import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { NOVIDADES } from '@/config/novidades';
import { mapEvent, parseWPDateTime, type Evento } from '@/features/events/utils';
import { fetchPosts } from '@/services/wordpress/client';
import { useEvents } from '@/services/wordpress/event-hooks';
import type { WPPost } from '@/services/wordpress/types';

/** Próximos eventos exibidos (em andamento ou em breve). */
const MAX_EVENTOS = 3;
/** Notícias recentes: as duas últimas publicadas nos últimos 30 dias. */
const MAX_NOTICIAS = 2;
const JANELA_NOTICIAS_MS = 30 * 86_400_000;
/** Mesma consulta da home (`usePosts(1, 5)`): na página inicial não há requisição extra. */
const NOTICIAS_POR_PAGINA = 5;

export const idEvento = (evento: Pick<Evento, 'id'>) => `evento-${evento.id}`;
export const idNoticia = (post: Pick<WPPost, 'id'>) => `noticia-${post.id}`;
export const idNovidade = (id: string) => `novidade-${id}`;

export function proximosEventos(eventos: Evento[]): Evento[] {
  return eventos
    .filter((evento) => evento.status === 'em-andamento' || evento.status === 'em-breve')
    .sort((a, b) => (parseWPDateTime(a.data) ?? 0) - (parseWPDateTime(b.data) ?? 0))
    .slice(0, MAX_EVENTOS);
}

export function noticiasRecentes(posts: WPPost[], agora = Date.now()): WPPost[] {
  return posts.filter((post) => agora - Date.parse(post.date) <= JANELA_NOTICIAS_MS).slice(0, MAX_NOTICIAS);
}

/**
 * Fontes reais das notificações: próximos eventos (/api/events, a mesma consulta da
 * agenda e da home), novidades versionadas em `src/config/novidades.ts` e, quando
 * `comNoticias`, as notícias recentes (/api/news). Sem dados, nada é inventado.
 */
export function useFontesNotificacoes(comNoticias: boolean) {
  const eventosQuery = useEvents();
  // Desligada, a consulta ainda devolve o que já está no cache (ex.: vindo da home).
  const noticiasQuery = useQuery({
    queryKey: ['wp', 'posts', 1, NOTICIAS_POR_PAGINA],
    queryFn: ({ signal }) => fetchPosts({ page: 1, perPage: NOTICIAS_POR_PAGINA, signal }),
    enabled: comNoticias,
  });

  const eventos = useMemo(() => proximosEventos((eventosQuery.data ?? []).map(mapEvent)), [eventosQuery.data]);
  const noticias = useMemo(() => noticiasRecentes(noticiasQuery.data?.posts ?? []), [noticiasQuery.data]);
  const ids = useMemo(
    () => [...NOVIDADES.map((novidade) => idNovidade(novidade.id)), ...eventos.map(idEvento), ...noticias.map(idNoticia)],
    [eventos, noticias],
  );

  // `carregando`: a primeira resposta de eventos ainda não chegou (o banner espera por ela).
  return { eventos, noticias, novidades: NOVIDADES, ids, carregando: eventosQuery.isPending };
}

export type FontesNotificacoes = ReturnType<typeof useFontesNotificacoes>;
