import { useEffect, useRef, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Check, Link2 } from 'lucide-react';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';
import { PAGE_METADATA } from '@/config/page-metadata';
import { tutoriais, type Tutorial } from '@/data/servicos';
import { GUIAS } from '@/data/tutoriais-guias';
import { medir } from '@/lib/medir';
import TutorialDetail from '../components/TutorialDetail';
import { PERFIS } from '../tutorial-profiles';

function CopiarLink({ path }: { path: string }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const timer = window.setTimeout(() => setCopiado(false), 2500);
    return () => window.clearTimeout(timer);
  }, [copiado]);

  const copiar = async () => {
    const url = `${window.location.origin}${path}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
    } catch {
      window.prompt('Copie o link do tutorial:', url);
    }
  };

  return (
    <button type="button" onClick={copiar} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-4 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10 focus-visible:outline-white">
      {copiado ? <Check className="h-4 w-4 text-crfal-gold" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
      <span aria-live="polite">{copiado ? 'Link copiado' : 'Copiar link'}</span>
    </button>
  );
}

function Conteudo({ tutorial }: { tutorial: Tutorial }) {
  const path = `/servicos/tutoriais/${tutorial.id}`;
  return (
    <div className="min-h-screen">
      <SEO {...PAGE_METADATA[path]} path={path} />
      <PageHero
        breadcrumb={[
          { label: 'Início', href: '/' },
          { label: 'Tutoriais', href: '/servicos/tutoriais' },
          { label: tutorial.titulo },
        ]}
        title={tutorial.titulo}
        section="servicos"
        lead={`${PERFIS[tutorial.perfil].label} · ${GUIAS[tutorial.id].tempoEstimado}`}
        actions={<CopiarLink path={path} />}
      />
      <div className="container-crfal py-4 md:py-8">
        <TutorialDetail key={tutorial.id} tutorial={tutorial} />
      </div>
    </div>
  );
}

export default function TutorialDetailPage() {
  const { id } = useParams();
  const tutorial = tutoriais.find((t) => t.id === id);

  const medido = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!tutorial || medido.current === tutorial.id) return;
    medido.current = tutorial.id;
    medir('abrir', { tarefa: tutorial.id });
  }, [tutorial]);

  if (!tutorial) return <Navigate to="/servicos/tutoriais" replace />;
  return <Conteudo tutorial={tutorial} />;
}
