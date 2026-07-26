import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { Eye, ShieldCheck, BookOpen, Scale, UserCheck } from 'lucide-react';

const objetivos = [
  { icon: Eye, title: 'Atendimento por farmacêutico', desc: 'Garantir o direito legal da população ao atendimento por profissional habilitado.' },
  { icon: ShieldCheck, title: 'Segurança em saúde', desc: 'Promover o uso racional de medicamentos e a segurança do paciente.' },
  { icon: Scale, title: 'Cumprimento normativo', desc: 'Assegurar o cumprimento das normas do exercício profissional.' },
];

const medidas = [
  'Intimação para providências técnicas e administrativas.',
  'Notificação para regularização de documentos e registros.',
  'Autuação e encaminhamento às autoridades competentes, quando cabível.',
];

export default function PapelFiscalizacaoPage() {
  return (
    <FiscalizacaoPageShell
      title="Papel da Fiscalização"
      description="Entenda o papel da fiscalização do CRFAL — objetivos, base normativa e medidas adotadas para garantir o exercício ético e legal da farmácia em Alagoas."
    >
      <p>
        O Conselho Regional de Farmácia do Estado de Alagoas é uma autarquia federal criada pela Lei Federal 3.820, de 11 de novembro de 1960. De acordo com a alínea c, do art. 10, uma de suas atribuições é fiscalizar o exercício da profissão farmacêutica.
      </p>

      <h2>Objetivos da fiscalização</h2>

      <div className="my-6 grid gap-4 sm:grid-cols-3">
        {objetivos.map((obj) => (
          <div key={obj.title} className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 transition-colors hover:border-crfal-blue/25 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-crfal-blue/30">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-crfal-blue-lighter text-crfal-blue dark:bg-slate-700 dark:text-crfal-blue-light">
              <obj.icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1.5 text-sm font-bold text-neutral-800 dark:text-white">{obj.title}</h3>
            <p className="text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">{obj.desc}</p>
          </div>
        ))}
      </div>

      <h2>Base normativa</h2>
      <p>
        A fiscalização segue atuação padronizada, conforme a Resolução CFF nº 700, de 29 de janeiro de 2021, além de manual de procedimentos próprio e deliberações aprovadas pelo Plenário do CRF-AL.
      </p>

      <div className="my-5 flex flex-wrap gap-3">
        {['Lei Federal 3.820/60', 'Resolução CFF nº 700/2021', 'Manual de procedimentos CRF-AL', 'Deliberações do Plenário'].map((item) => (
          <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-crfal-blue/20 bg-crfal-blue-lighter px-3 py-1.5 text-xs font-medium text-crfal-blue dark:border-crfal-blue/30 dark:bg-crfal-blue/10 dark:text-crfal-blue-light">
            <BookOpen className="h-3 w-3" />
            {item}
          </span>
        ))}
      </div>

      <h2>Medidas adotadas em irregularidades</h2>

      <div className="my-5 space-y-3">
        {medidas.map((medida, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/60">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crfal-blue text-xs font-bold text-white">{i + 1}</span>
            <p className="text-sm leading-relaxed text-neutral-700 dark:text-slate-200">{medida}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/50 p-5 dark:border-crfal-blue/25 dark:bg-crfal-blue/10">
        <div className="flex items-start gap-3">
          <UserCheck className="mt-0.5 h-5 w-5 shrink-0 text-crfal-blue dark:text-crfal-blue-light" />
          <p className="text-sm leading-relaxed text-neutral-700 dark:text-slate-200">
            A fiscalização é exercida <strong>exclusivamente por farmacêuticos fiscais</strong> aprovados em concurso público, com atuação em todo o estado de Alagoas, inclusive em períodos noturnos, finais de semana e feriados.
          </p>
        </div>
      </div>
    </FiscalizacaoPageShell>
  );
}
