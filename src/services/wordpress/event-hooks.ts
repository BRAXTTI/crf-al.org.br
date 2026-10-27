import { requestJson } from '../http';
import type { WPEventListing } from './types';
import { useQuery } from '@tanstack/react-query';
import { fetchEventById, fetchEventBySlug, fetchEvents } from './client';

export function useEventBySlug(slug: string) {
  return useQuery({
    queryKey: ['wp', 'event', 'slug', slug],
    queryFn: ({ signal }) => fetchEventBySlug(slug, signal),
    enabled: Boolean(slug),
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ['wp', 'events'],
    queryFn: ({ signal }) => fetchEvents(signal),
  });
}

export function useEventById(id: number) {
  return useQuery({
    queryKey: ['wp', 'event', 'id', id],
    queryFn: ({ signal }) => fetchEventById(id, signal),
    enabled: Number.isFinite(id),
  });
}

/** Consulta limitada: o detalhe nunca baixa o catálogo completo. */
export function useRelatedEvents(id?: number) {
  return useQuery({ queryKey: ['wp', 'events-related', id], queryFn: ({ signal }) => requestJson<WPEventListing[]>(`/api/events?related=${id}`, { signal }), enabled: Boolean(id) });
}
