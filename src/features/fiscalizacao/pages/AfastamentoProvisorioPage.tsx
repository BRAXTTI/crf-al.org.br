import { Link } from 'react-router-dom';
import { ArrowRight, CalendarOff, Clock, FileCheck, Laptop, ShieldCheck, UserCheck } from 'lucide-react';
import FiscalizacaoPageShell from './FiscalizacaoPageShell';

const passos = [
  {
    icon: Laptop,
    title: 'Acessar o CRF AL em Casa',
    desc: 'Faça login no CRF AL em Casa como Pessoa Física e abra a opção "Comunicado de Afastamento Provisório".',
  },
  {
    icon: FileCheck,
    title: 'Registrar o período e anexar o comprovante',
    desc: 'Selecione a responsabilidade técnica (RT), o motivo da ausência, informe as datas (e horários, quando o motivo permitir), anexe o comprovante e salve o protocolo.',
  },
  {
    icon: UserCheck,
    title: 'Manter documentação',
    desc: 'Acompanhe a solicitação em "Protocolos Web" e guarde cópia ou original do protocolo junto à Certidão de Regularidade Técnica do estabelecimento.',
  },
  {
    icon: ShieldCheck,
    title: 'Apresentar na inspeção',
    desc: 'A comprovação do protocolo deve ser apresentada ao farmacêutico fiscal no momento da inspeção.',
  },
];

export default function AfastamentoProvisorioPage() {
  return (
    <FiscalizacaoPageShell
      title="Afastamento Provisório"
      lead="Como comunicar o afastamento provisório do farmacêutico pelo CRF AL em Casa."
      description="Saiba como comunicar o afastamento provisório do farmacêutico ao CRF-AL pelo CRF AL em Casa — passo a passo, comprovante e acompanhamento do protocolo."
    >
      <p>
        A comunicação de afastamento provisório do farmacêutico é feita integralmente pelo sistema <strong>CRF AL em Casa</strong>, sem necessidade de baixar requerimento avulso ou enviar pedido por e-mail. Confira o{' '}
        <Link
          to="/servicos/tutoriais/afastamento-provisorio"
          className="font-semibold text-crfal-blue underline decoration-crfal-gold underline-offset-2 hover:text-crfal-blue-dark"
        >
          tutorial de comunicado de afastamento provisório
        </Link>
        .
      </p>

      <div className="my-5">
        <Link
          to="/servicos/tutoriais/afastamento-provisorio"
          className="group flex min-h-11 items-center gap-3.5 rounded-xl border border-crfal-gray-200 px-4 py-3.5 transition-colors hover:bg-crfal-gray-50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-crfal-blue">
            <CalendarOff className="h-5 w-5" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[15px] font-semibold leading-snug text-crfal-blue-dark">
              Comunicar afastamento provisório (tutorial em vídeo)
            </span>
            <span className="mt-0.5 block text-sm leading-snug text-crfal-gray-600">
              Veja o passo a passo completo para registrar o comunicado pelo CRF AL em Casa.
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-crfal-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-[#8A6A12] motion-reduce:transition-none" aria-hidden />
        </Link>
      </div>

      <h2>Passo a passo</h2>

      <div className="my-6 space-y-4">
        {passos.map((passo, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-sm font-bold text-crfal-blue">
                {i + 1}
              </span>
              {i < passos.length - 1 && (
                <div className="mt-1 h-full w-px bg-neutral-200" />
              )}
            </div>
            <div className="pb-5">
              <h3 className="mb-1 text-sm font-bold text-neutral-800">{passo.title}</h3>
              <p className="text-sm leading-relaxed text-crfal-gray-600">{passo.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Justificativa de ausência e documentos originais</h2>
      <p>
        Tanto o comunicado de afastamento provisório quanto a justificativa de ausência identificada em inspeção são registrados pelo <strong>CRF AL em Casa</strong>. Quando exigida a conferência presencial (como no caso de atestado médico), os documentos originais devem ser apresentados na sede ou seccional do CRF-AL no prazo de <strong>10 dias</strong>.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/50 p-5">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-crfal-blue" aria-hidden />
        <p className="text-sm leading-relaxed text-neutral-700">
          <strong>Prazo máximo:</strong> 10 dias corridos, contados a partir do primeiro dia útil após a inspeção, para apresentação dos documentos originais na sede ou seccional do CRF-AL.
        </p>
      </div>
    </FiscalizacaoPageShell>
  );
}
