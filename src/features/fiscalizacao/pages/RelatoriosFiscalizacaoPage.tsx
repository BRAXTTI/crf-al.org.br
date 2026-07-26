import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { BarChart3, TrendingUp, ShieldCheck, Target } from 'lucide-react';

const finalidades = [
  {
    icon: Target,
    title: 'Consolidar resultados',
    desc: 'Apresentar os resultados obtidos frente às metas do Plano de Fiscalização Anual.',
  },
  {
    icon: TrendingUp,
    title: 'Análise técnica',
    desc: 'Permitir análise de acertos, deficiências e dificuldades operacionais do período.',
  },
  {
    icon: ShieldCheck,
    title: 'Ações corretivas',
    desc: 'Subsidiar ações corretivas e melhoria contínua dos atos de fiscalização.',
  },
];

export default function RelatoriosFiscalizacaoPage() {
  return (
    <FiscalizacaoPageShell
      title="Relatórios de Fiscalização"
      description="Acesse os Relatórios de Fiscalização Anual (RFA) do CRFAL — resultados e execução das atividades de fiscalização farmacêutica em Alagoas."
    >
      <p>
        O Relatório de Fiscalização Anual (RFA) apresenta a execução e os resultados das atividades de fiscalização do exercício profissional no exercício anterior.
      </p>

      <h2>Finalidade do RFA</h2>

      <div className="my-6 grid gap-4 sm:grid-cols-3">
        {finalidades.map((fn) => (
          <div key={fn.title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-crfal-blue/25 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-crfal-blue/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue dark:bg-slate-700 dark:text-crfal-blue-light">
              <fn.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-neutral-800 dark:text-white">{fn.title}</h3>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{fn.desc}</p>
          </div>
        ))}
      </div>

      <h2>Uso institucional</h2>
      <p>
        Os dados do relatório apoiam decisões administrativas e o aprimoramento da eficiência fiscalizatória, fortalecendo a proteção da sociedade e a valorização do exercício farmacêutico regular.
      </p>

      <div className="mt-6 flex items-center gap-3 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/50 p-5 dark:border-crfal-blue/25 dark:bg-crfal-blue/10">
        <BarChart3 className="h-5 w-5 shrink-0 text-crfal-blue dark:text-crfal-blue-light" />
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-slate-200">
          Os relatórios são publicados anualmente e estão disponíveis para consulta pelo Portal da Transparência do CRFAL.
        </p>
      </div>
    </FiscalizacaoPageShell>
  );
}
