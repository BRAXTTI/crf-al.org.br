import { useQuery } from '@tanstack/react-query';
import { requestJson } from '@/services/http';
import type { WPPost } from '@/services/wordpress/types';
import { stripHTML } from '@/services/wordpress/client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';

interface SearchItem { label: string; href: string }
const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export default function MobileHeaderSearch({ open, onOpenChange, items, triggerRef }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: SearchItem[];
  triggerRef: RefObject<HTMLButtonElement | null>;
}) {
  const [query, setQuery] = useState('');
  const [term, setTerm] = useState('');
  useEffect(() => { const timer = setTimeout(() => setTerm(query.trim()), 350); return () => clearTimeout(timer); }, [query]);
  const news = useQuery({ queryKey: ['news-search', term], queryFn: ({ signal }) => requestJson<WPPost[]>(`/api/news?search=${encodeURIComponent(term)}`, { signal }), enabled: open && term.length >= 3 && term.length <= 120 });
  const inputRef = useRef<HTMLInputElement>(null);
  const results = items.filter(item => normalize(item.label).includes(normalize(query.trim())));

  return (
    <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setQuery(''); }}>
      <DialogContent showCloseButton={false} onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus(); }} onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }} className="max-h-[85dvh] overflow-y-auto p-5">
        <DialogTitle className="pr-8 text-crfal-blue">Buscar no portal</DialogTitle>
        <DialogDescription>Encontre páginas, serviços e notícias do CRF AL. Para notícias, digite pelo menos 3 caracteres.</DialogDescription>
        <DialogClose aria-label="Fechar busca" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-crfal-blue hover:bg-crfal-blue-lighter"><X className="h-5 w-5" aria-hidden="true" /></DialogClose>
        <div className="relative">
          <label htmlFor="portal-search" className="sr-only">Buscar páginas e serviços</label>
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-crfal-blue" aria-hidden="true" />
          <input ref={inputRef} id="portal-search" type="search" value={query} onChange={event => setQuery(event.target.value)} maxLength={120} placeholder="O que você procura?" className="min-h-11 w-full rounded-lg border border-crfal-gray-300 bg-white pl-10 pr-12 text-base" />
          {query && <button type="button" aria-label="Limpar busca" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center rounded-lg text-crfal-blue"><X className="h-4 w-4" aria-hidden="true" /></button>}
        </div>
        <p role="status" className="text-xs text-crfal-gray-600">{results.length ? `${results.length} páginas e serviços encontrados` : 'Nenhum resultado. Tente outro termo.'}</p>
        <ul className="divide-y divide-crfal-gray-200">
          {results.map(item => <li key={`${item.href}|${item.label}`}>
            {item.href.startsWith('/') ? (
              <Link to={item.href} onClick={() => { onOpenChange(false); setQuery(''); }} className="flex min-h-11 items-center rounded-md px-2 py-3 text-sm font-semibold text-crfal-blue hover:bg-crfal-blue-lighter">{item.label}</Link>
            ) : (
              <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => { onOpenChange(false); setQuery(''); }} className="flex min-h-11 items-center justify-between rounded-md px-2 py-3 text-sm font-semibold text-crfal-blue hover:bg-crfal-blue-lighter">{item.label}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Abre em uma nova aba.</span></a>
            )}
          </li>)}
        </ul>
        {term.length >= 3 && <section aria-label="Resultados de notícias">
          <h2 className="font-semibold text-crfal-blue">Notícias</h2>
          <p role="status">{news.isFetching ? 'Buscando notícias…' : news.isError ? 'Não foi possível buscar notícias. Tente novamente.' : news.data?.length ? `${news.data.length} notícias encontradas` : 'Nenhuma notícia encontrada.'}</p>
          <ul>{news.data?.map(post => <li key={post.slug}><Link className="block py-3 text-crfal-blue underline" to={`/imprensa/noticias/${post.slug}`} onClick={() => { onOpenChange(false); setQuery(''); }}>{stripHTML(post.title.rendered)}</Link></li>)}</ul>
        </section>}
      </DialogContent>
    </Dialog>
  );
}
