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
