import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenText,
  CalendarClock,
  FileSearch,
  FileWarning,
  Gavel,
  Megaphone,
  ShieldCheck,
} from 'lucide-react';
import FiscalizacaoPageShell from './FiscalizacaoPageShell';

const requerimentosPJ = '/servicos/requerimentos?perfil=pessoa-juridica';

const tarefas = [
  {
    icon: FileWarning,
    title: 'Recebi um termo ou auto de infração',
    desc: 'Entenda o processo e como apresentar defesa.',
    href: '/fiscalizacao/processo-administrativo-fiscal',
  },
  {
    icon: CalendarClock,
    title: 'Vou me afastar da responsabilidade técnica',
    desc: 'Comunique o afastamento provisório.',
    href: '/fiscalizacao/afastamento-provisorio',
  },
  {
    icon: Megaphone,
    title: 'Quero denunciar uma irregularidade',
    desc: 'Registre a denúncia na Ouvidoria, inclusive sem se identificar.',
    href: '/servicos/ouvidoria',
  },
  {
    icon: BookOpenText,
    title: 'Consultar a legislação',
    desc: 'Leis e resoluções que regem a fiscalização.',
    href: '/legislacao',
  },
];

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
  {
    text: 'Falta de registro do estabelecimento junto ao Conselho.',
    action: 'Registro de estabelecimentos',
    href: `${requerimentosPJ}&categoria=registro-inicial`,
  },
  {
    text: 'Ausência de responsável técnico no exercício regular.',
    action: 'Responsabilidade técnica',
    href: `${requerimentosPJ}&categoria=responsabilidade-tecnica`,
  },
  {
    text: 'Assistência farmacêutica insuficiente em relação à legislação vigente.',
    action: 'Horários e assistência farmacêutica',
    href: `${requerimentosPJ}&categoria=horarios-assistencia`,
  },
];

const defesa = [
  { title: 'Defesa ao Auto de Infração', desc: 'Documentos e passo a passo no CRF AL em Casa.', href: `${requerimentosPJ}&item=defesa-auto-infracao` },
  { title: 'Recurso de Multa Fiscal', desc: 'Contra multa fiscal homologada.', href: `${requerimentosPJ}&item=recurso-multa-fiscal` },
];

const motion = 'transition-transform motion-reduce:transition-none';

function LinkRow({ icon: Icon, title, desc, href }: { icon?: React.ElementType; title: string; desc: string; href: string }) {
  return (
    <li>
      <Link to={href} className="group flex min-h-11 items-center gap-3.5 px-4 py-3.5 transition-colors hover:bg-crfal-gray-50">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold leading-snug text-crfal-blue-dark">{title}</span>
          <span className="mt-0.5 block text-sm leading-snug text-crfal-gray-600">{desc}</span>
        </span>
        <ArrowRight className={`h-5 w-5 shrink-0 text-crfal-gray-400 group-hover:translate-x-1 group-hover:text-[#8A6A12] ${motion}`} aria-hidden />
      </Link>
    </li>
  );
}

export default function FiscalizacaoPage() {
  return (
    <FiscalizacaoPageShell
      title="Fiscalização"
      lead="Como o CRF-AL fiscaliza o exercício da profissão farmacêutica em Alagoas: procedimentos, instrumentos, penalidades e base legal."
      description="Saiba como o CRFAL fiscaliza o exercício profissional farmacêutico em Alagoas — procedimentos, atuações, penalidades e base legal."
      meta={[
        { value: 'Lei 3.820/60', label: 'base legal' },
        { value: 'Res. CFF 700/21', label: 'resolução vigente' },
      ]}
    >
      <p>
        O Conselho Regional de Farmácia do Estado de Alagoas é uma autarquia federal criada pela Lei Federal 3.820, de 11 de novembro de 1960. Entre suas atribuições legais está fiscalizar o exercício da profissão farmacêutica e coibir infrações à legislação.
      </p>

      <h2>O que você precisa?</h2>

      <div className="my-5">
        <ul className="divide-y divide-crfal-gray-200 overflow-hidden rounded-xl border border-crfal-gray-200">
          {tarefas.map((tarefa) => (
            <LinkRow key={tarefa.href} {...tarefa} />
          ))}
        </ul>
      </div>

      <h2>Atribuições da fiscalização</h2>

      <div className="my-5">
        <ul className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {funcoes.map((fn) => (
            <li key={fn.title} className="flex gap-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue ring-1 ring-crfal-gold/40">
                <fn.icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="text-[15px] font-semibold text-crfal-blue-dark">{fn.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-crfal-gray-600">{fn.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <h2>Procedimento fiscal</h2>
      <p>
        O procedimento fiscal observa as normas do CFF sobre presença do farmacêutico e condições do exercício profissional. O Processo Administrativo Fiscal é instaurado a partir da lavratura do Auto de Infração.
      </p>

      <div className="my-5 rounded-xl border border-amber-200 bg-amber-50/70 p-5">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-600" aria-hidden />
          <h3 className="text-sm font-semibold text-amber-800">Principais infrações e como regularizar</h3>
        </div>
        <ul className="space-y-3">
          {infracoes.map((item) => (
            <li key={item.text} className="flex items-start gap-2.5 text-sm text-amber-900">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" aria-hidden />
              <span>
                {item.text}{' '}
                <Link to={item.href} className="group inline-flex items-center gap-1 font-semibold text-amber-900 underline decoration-amber-400 underline-offset-2 hover:decoration-amber-700">
                  {item.action}
                  <ArrowRight className={`h-3.5 w-3.5 group-hover:translate-x-0.5 ${motion}`} aria-hidden />
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <h2>Defesa, multas e penalidades</h2>
      <p>
        O estabelecimento autuado pode apresentar defesa escrita no prazo indicado na notificação. Em caso de infração confirmada, podem ser aplicadas multas previstas na Lei 3.820/60 e penalidades éticas cabíveis, conforme o rito processual vigente.
      </p>

      <div className="mt-5">
        <ul className="divide-y divide-crfal-gray-200 overflow-hidden rounded-xl border border-crfal-gray-200">
          {defesa.map((item) => (
            <LinkRow key={item.href} {...item} />
          ))}
        </ul>
      </div>
    </FiscalizacaoPageShell>
  );
}
