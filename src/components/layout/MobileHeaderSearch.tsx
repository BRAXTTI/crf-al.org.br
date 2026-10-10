import { useRef, useState, type RefObject } from 'react';
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
  const inputRef = useRef<HTMLInputElement>(null);
  const results = items.filter(item => normalize(item.label).includes(normalize(query.trim())));

  return (
    <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setQuery(''); }}>
      <DialogContent showCloseButton={false} onOpenAutoFocus={event => { event.preventDefault(); inputRef.current?.focus(); }} onCloseAutoFocus={event => { event.preventDefault(); triggerRef.current?.focus(); }} className="max-h-[85dvh] overflow-y-auto p-5">
        <DialogTitle className="pr-8 text-crfal-blue">Buscar no portal</DialogTitle>
        <DialogDescription>Encontre páginas e serviços do CRF AL.</DialogDescription>
        <DialogClose aria-label="Fechar busca" className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-lg text-crfal-blue hover:bg-crfal-blue-lighter"><X className="h-5 w-5" aria-hidden="true" /></DialogClose>
        <div className="relative">
          <label htmlFor="portal-search" className="sr-only">Buscar páginas e serviços</label>
          <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-crfal-blue" aria-hidden="true" />
          <input ref={inputRef} id="portal-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="O que você procura?" className="min-h-11 w-full rounded-lg border border-crfal-gray-300 bg-white pl-10 pr-12 text-base" />
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
      </DialogContent>
    </Dialog>
  );
}
