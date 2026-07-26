import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { ClipboardCheck, BellRing, Megaphone, FileText, CalendarClock } from 'lucide-react';

const instrumentos = [
  {
    icon: ClipboardCheck,
    title: 'Termo de Inspeção',
    desc: 'Documento preenchido manual ou eletronicamente pelo farmacêutico fiscal, destinado à verificação do exercício das atividades farmacêuticas nos estabelecimentos. Seu preenchimento é obrigatório em todas as inspeções.',
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    icon: BellRing,
    title: 'Termo de Notificação',
    desc: 'Determina providências imediatas aos representantes legais quanto à documentação e registros. O prazo para atendimento é de 5 dias úteis.',
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  {
    icon: Megaphone,
    title: 'Termo de Intimação',
    desc: 'Determina providências imprescindíveis ao farmacêutico e/ou ao estabelecimento, especialmente sobre atividades farmacêuticas e condições do exercício profissional.',
    color: 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
];

export default function InstrumentosFiscalizacaoPage() {
  return (
    <FiscalizacaoPageShell
      title="Instrumentos de Fiscalização"
      description="Conheça os instrumentos formais utilizados pelo CRFAL na fiscalização do exercício farmacêutico em Alagoas — autos, termos e notificações."
    >
      <p>
        A fiscalização utiliza instrumentos formais para registrar constatações e determinar providências, assegurando transparência e padronização dos atos fiscalizatórios.
      </p>

      <div className="my-6 space-y-5">
        {instrumentos.map((inst) => (
          <div key={inst.title} className="overflow-hidden rounded-xl border border-neutral-200 bg-white transition-colors hover:border-crfal-blue/20 dark:border-slate-700 dark:bg-slate-800/60 dark:hover:border-crfal-blue/25">
            <div className="flex items-center gap-3 border-b border-neutral-100 p-4 dark:border-slate-700">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${inst.color}`}>
                <inst.icon className="h-5 w-5" />
              </span>
              <h3 className="text-base font-bold text-neutral-800 dark:text-white">{inst.title}</h3>
            </div>
            <div className="p-4">
              <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">{inst.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <FileText className="h-5 w-5 shrink-0 text-crfal-blue dark:text-crfal-blue-light" />
          <div>
            <p className="text-xs font-semibold text-neutral-800 dark:text-white">Preenchimento</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Manual ou eletrônico</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
          <CalendarClock className="h-5 w-5 shrink-0 text-crfal-blue dark:text-crfal-blue-light" />
          <div>
            <p className="text-xs font-semibold text-neutral-800 dark:text-white">Prazo de atendimento</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Até 5 dias úteis</p>
          </div>
        </div>
      </div>
    </FiscalizacaoPageShell>
  );
}
