import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { FileWarning, Clock, Scale, Gavel, Send } from 'lucide-react';

const fluxo = [
  {
    step: 1,
    icon: FileWarning,
    title: 'Lavratura do auto de infração',
    desc: 'Realizada pelo farmacêutico fiscal no momento da inspeção, com entrega do termo de inspeção e do auto.',
    color: 'from-red-500 to-red-600',
  },
  {
    step: 2,
    icon: Send,
    title: 'Prazo para defesa escrita',
    desc: 'O estabelecimento tem 5 dias corridos, contados do primeiro dia útil seguinte, para apresentar defesa escrita ao CRF-AL.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    step: 3,
    icon: Scale,
    title: 'Julgamento pelo Plenário',
    desc: 'O Plenário do CRF-AL analisa as defesas e julga os processos, decidindo pelo arquivamento ou pela aplicação de penalidade.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    step: 4,
    icon: Gavel,
    title: 'Penalidades e recursos',
    desc: 'Multa de 1 a 3 salários mínimos regionais (dobro em reincidência), com possibilidade de recurso ao CFF.',
    color: 'from-crfal-blue to-crfal-blue-dark',
  },
];

export default function ProcessoAdministrativoFiscalPage() {
  return (
    <FiscalizacaoPageShell
      title="Processo Administrativo Fiscal"
      description="Entenda o Processo Administrativo Fiscal do CRFAL — rito processual, defesa, multas e penalidades para infrações à legislação farmacêutica em Alagoas."
    >
      <p>
        O Processo Administrativo Fiscal é instaurado a partir da lavratura do auto de infração para estabelecimento que infringir determinações da Lei 3.820/60, observando o rito da Resolução CFF nº 566/12.
      </p>

      <h2>Fluxo do processo</h2>

      <div className="my-6 space-y-4">
        {fluxo.map((etapa) => (
          <div key={etapa.step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${etapa.color} text-sm font-bold text-white shadow-sm`}>
                {etapa.step}
              </span>
              {etapa.step < fluxo.length && (
                <div className="mt-1 h-full w-px bg-neutral-200 dark:bg-slate-700" />
              )}
            </div>
            <div className="pb-6">
              <h3 className="mb-1 text-sm font-bold text-neutral-800 dark:text-white">{etapa.title}</h3>
              <p className="text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">{etapa.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-crfal-gray-200 bg-crfal-gray-50 p-5 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-start gap-3">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-white">Atenção aos prazos</p>
            <ul className="mt-1.5 space-y-1.5">
              <li className="text-sm text-crfal-gray-600 dark:text-crfal-gray-400">Defesa intempestiva não é considerada para fins de julgamento.</li>
              <li className="text-sm text-crfal-gray-600 dark:text-crfal-gray-400">Na ausência de defesa válida, o processo segue o rito regular, podendo resultar em revelia.</li>
            </ul>
          </div>
        </div>
      </div>
    </FiscalizacaoPageShell>
  );
}
