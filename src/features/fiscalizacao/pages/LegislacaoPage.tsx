import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { BookOpen, ExternalLink, FileText, Scale } from 'lucide-react';

const referencias = [
  {
    icon: FileText,
    title: 'Lei Federal nº 3.820/1960',
    desc: 'Cria os Conselhos Federal e Regionais de Farmácia e estabelece suas atribuições legais.',
  },
  {
    icon: BookOpen,
    title: 'Resoluções do CFF',
    desc: 'Normas do Conselho Federal de Farmácia que regulamentam o exercício profissional em todo o Brasil.',
  },
  {
    icon: Scale,
    title: 'Normas complementares',
    desc: 'Legislação relacionada à assistência farmacêutica, responsabilidade técnica e vigilância sanitária.',
  },
];

export default function LegislacaoPage() {
  return (
    <FiscalizacaoPageShell
      title="Legislação"
      description="Consulte a legislação farmacêutica aplicável ao exercício profissional e à fiscalização do CRFAL em Alagoas — leis, resoluções e atos normativos."
    >
      <p>
        Esta área reúne referências para consulta da legislação profissional farmacêutica e dos atos normativos aplicáveis ao exercício e à fiscalização.
      </p>

      <h2>Referências principais</h2>

      <div className="my-5 grid gap-4 sm:grid-cols-3">
        {referencias.map((ref) => (
          <div key={ref.title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-crfal-blue/25 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-crfal-blue/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue dark:bg-slate-700 dark:text-crfal-blue-light">
              <ref.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-neutral-800 dark:text-white">{ref.title}</h3>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{ref.desc}</p>
          </div>
        ))}
      </div>

      <h2>Consulta atualizada</h2>
      <p>
        Para acessar textos integrais, versões atualizadas de normas e atos recentes, utilize o portal oficial do Conselho Federal de Farmácia.
      </p>

      <a
        href="https://www.cff.org.br"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-crfal-blue px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-crfal-blue-dark"
      >
        <ExternalLink className="h-4 w-4" />
        Acessar portal do CFF
      </a>
    </FiscalizacaoPageShell>
  );
}
