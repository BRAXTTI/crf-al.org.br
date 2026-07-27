import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { ShieldCheck, FileSearch, Gavel, AlertTriangle } from 'lucide-react';

const funcoes = [
  {
    icon: FileSearch,
    title: 'Inspeções regulares',
    desc: 'Inspeções em estabelecimentos farmacêuticos em todos os municípios de Alagoas.',
  },
  {
    icon: ShieldCheck,
    title: 'Garantia da assistência',
    desc: 'Assegurar que a população tenha assistência farmacêutica ética, efetiva e segura.',
  },
  {
    icon: AlertTriangle,
    title: 'Coibir infrações',
    desc: 'Identificar e coibir irregularidades ao exercício profissional e à legislação vigente.',
  },
  {
    icon: Gavel,
    title: 'Encaminhamento legal',
    desc: 'Encaminhar demandas e infrações aos órgãos competentes quando necessário.',
  },
];

const infracoes = [
  'Falta de registro do estabelecimento junto ao Conselho.',
  'Ausência de responsável técnico no exercício regular.',
  'Assistência farmacêutica insuficiente em relação à legislação vigente.',
];

export default function FiscalizacaoPage() {
  return (
    <FiscalizacaoPageShell
      title="Fiscalização"
      description="Saiba como o CRFAL fiscaliza o exercício profissional farmacêutico em Alagoas — procedimentos, atuações, penalidades e base legal."
    >
      <p>
        O Conselho Regional de Farmácia do Estado de Alagoas é uma autarquia federal criada pela Lei Federal 3.820, de 11 de novembro de 1960. Entre suas atribuições legais está fiscalizar o exercício da profissão farmacêutica e coibir infrações à legislação.
      </p>

      <h2>Atribuições da fiscalização</h2>

      <div className="my-6 grid gap-4 sm:grid-cols-2">
        {funcoes.map((fn) => (
          <div key={fn.title} className="rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 p-5 transition-colors hover:border-crfal-blue/25 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-crfal-blue/30 dark:hover:bg-slate-800">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-green-light text-crfal-green dark:bg-crfal-green/20 dark:text-crfal-green">
              <fn.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-2 text-sm font-bold text-neutral-800 dark:text-white">{fn.title}</h3>
            <p className="text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">{fn.desc}</p>
          </div>
        ))}
      </div>

      <h2>Procedimento fiscal</h2>
      <p>
        O procedimento fiscal observa as normas do CFF sobre presença do farmacêutico e condições do exercício profissional. O Processo Administrativo Fiscal é instaurado a partir da lavratura do Auto de Infração.
      </p>

      <div className="my-5 rounded-xl border border-amber-200 bg-amber-50/70 p-5 dark:border-amber-600/25 dark:bg-amber-900/15">
        <div className="mb-2.5 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Principais infrações</span>
        </div>
        <ul className="space-y-2">
          {infracoes.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-200">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <h2>Defesa, multas e penalidades</h2>
      <p>
        O estabelecimento autuado pode apresentar defesa escrita no prazo legal. Em caso de infração confirmada, podem ser aplicadas multas previstas na Lei 3.820/60 e penalidades éticas cabíveis, conforme o rito processual vigente.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { value: 'Lei 3.820/60', label: 'Base legal' },
          { value: 'CFF nº 700/21', label: 'Resolução vigente' },
          { value: 'CRFAL', label: 'Execução estadual' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-crfal-gray-200 bg-white px-4 py-3.5 text-center dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-lg font-bold text-crfal-blue dark:text-crfal-blue-light">{s.value}</p>
            <p className="text-[10px] font-medium uppercase tracking-wider text-crfal-gray-500 dark:text-crfal-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
    </FiscalizacaoPageShell>
  );
}
