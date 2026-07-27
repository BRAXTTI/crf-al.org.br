import FiscalizacaoPageShell from './FiscalizacaoPageShell';
import { Mail, FileText, UserCheck, ShieldCheck, Clock } from 'lucide-react';

const passos = [
  {
    icon: FileText,
    title: 'Preencher o requerimento',
    desc: 'Utilize o requerimento de afastamento provisório disponível na seção de Requerimentos do site.',
  },
  {
    icon: Mail,
    title: 'Protocolar o pedido',
    desc: 'Protocole presencialmente na sede ou seccional do CRF-AL, ou envie por e-mail para fiscalizacao@crf-al.org.br.',
  },
  {
    icon: UserCheck,
    title: 'Manter documentação',
    desc: 'Guarde cópia ou original do protocolo junto à Certidão de Regularidade Técnica do estabelecimento.',
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
      description="Saiba como comunicar o afastamento provisório do farmacêutico ao CRFAL — procedimentos, requerimento e canais de protocolo em Alagoas."
    >
      <p>
        As comunicações de afastamento provisório do farmacêutico podem ser protocoladas na sede ou seccional do CRF-AL, ou encaminhadas para fiscalizacao@crf-al.org.br mediante requerimento próprio.
      </p>

      <h2>Passo a passo</h2>

      <div className="my-6 space-y-4">
        {passos.map((passo, i) => (
          <div key={i} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-crfal-blue-lighter text-sm font-bold text-crfal-blue dark:bg-slate-700 dark:text-crfal-blue-light">
                {i + 1}
              </span>
              {i < passos.length - 1 && (
                <div className="mt-1 h-full w-px bg-neutral-200 dark:bg-slate-700" />
              )}
            </div>
            <div className="pb-5">
              <h3 className="mb-1 text-sm font-bold text-neutral-800 dark:text-white">{passo.title}</h3>
              <p className="text-sm leading-relaxed text-crfal-gray-600 dark:text-crfal-gray-400">{passo.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Justificativa posterior de ausência</h2>
      <p>
        Havendo autuação e impossibilidade de protocolo presencial, o estabelecimento pode encaminhar requerimento e documentos comprobatórios por e-mail. Os documentos originais devem ser apresentados na sede ou seccional do CRF-AL no prazo de <strong>10 dias</strong>, contados do primeiro dia útil após a inspeção.
      </p>

      <div className="mt-4 flex items-start gap-3 rounded-xl border border-crfal-blue/15 bg-crfal-blue-lighter/50 p-5 dark:border-crfal-blue/25 dark:bg-crfal-blue/10">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-crfal-blue dark:text-crfal-blue-light" />
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-slate-200">
          <strong>Prazo máximo:</strong> 10 dias corridos, contados a partir do primeiro dia útil após a inspeção, para apresentação dos documentos originais.
        </p>
      </div>
    </FiscalizacaoPageShell>
  );
}
