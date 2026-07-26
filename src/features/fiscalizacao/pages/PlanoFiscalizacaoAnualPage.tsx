import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { FileText, Users, ClipboardList, BarChart3, MapPin, ShieldCheck } from 'lucide-react';

const etapas = [
  { icon: Users, title: 'Construção conjunta', desc: 'Elaborado pelo vice-presidente, gerente de fiscalização e farmacêuticos fiscais do CRF-AL.' },
  { icon: ClipboardList, title: 'Revisão plenária', desc: 'Revisado e aprovado anualmente em reunião do Plenário do CRF-AL.' },
  { icon: ShieldCheck, title: 'Orientação pelo CFF', desc: 'Segue as diretrizes da Resolução CFF nº 700/2021 para padronização dos atos fiscalizatórios.' },
];

const conteudos = [
  { icon: MapPin, text: 'Estrutura do setor de fiscalização e distribuição dos fiscais no estado.' },
  { icon: FileText, text: 'Exigências de assistência farmacêutica por tipo de estabelecimento.' },
  { icon: ClipboardList, text: 'Procedimentos, priorização de inspeções e situações passíveis de autuação.' },
  { icon: BarChart3, text: 'Ações conjuntas, orçamento setorial e dados de fiscalização em Alagoas.' },
];

export default function PlanoFiscalizacaoAnualPage() {
  return (
    <FiscalizacaoPageShell
      title="Plano de Fiscalização Anual"
      description="Acesse o Plano de Fiscalização Anual (PFA) do CRFAL — documento estratégico que orienta as atividades de fiscalização farmacêutica em Alagoas."
    >
      <p>
        O Plano de Fiscalização Anual (PFA) é o documento estratégico para planejamento, elaboração e execução das atividades de fiscalização do exercício profissional.
      </p>

      <h2>Etapas de elaboração</h2>

      <div className="my-5 space-y-3">
        {etapas.map((etapa, i) => (
          <div key={i} className="flex items-start gap-4 rounded-lg border border-neutral-200 bg-neutral-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue dark:bg-slate-700 dark:text-crfal-blue-light">
              <etapa.icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-neutral-800 dark:text-white">{etapa.title}</h3>
              <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{etapa.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Conteúdo do plano</h2>

      <div className="my-5 grid gap-3 sm:grid-cols-2">
        {conteudos.map((item, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-crfal-blue dark:text-crfal-blue-light" />
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-slate-200">{item.text}</p>
          </div>
        ))}
      </div>
    </FiscalizacaoPageShell>
  );
}
