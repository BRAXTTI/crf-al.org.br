import { ChevronRight } from 'lucide-react';
import SEO from '@/components/SEO';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-crfal-gray-50">
      <SEO
        title="Política de Privacidade"
        description="Política de Privacidade do CRFAL — saiba como tratamos seus dados pessoais em conformidade com a LGPD."
        path="/politica-de-privacidade"
        noindex
      />
      <div className="relative bg-gradient-to-br from-crfal-blue via-crfal-blue-dark to-[#002a4a] pt-28 pb-16 md:pt-32 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-crfal-blue-light rounded-full blur-3xl" />
        </div>
        <div className="container-crfal relative z-10">
          <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
            <a href="/" className="hover:text-white transition-colors">Início</a>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Política de Privacidade</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Política de Privacidade</h1>
          <p className="text-white/80 text-lg max-w-3xl">
            Esta política descreve como os dados pessoais são coletados, utilizados e protegidos pelo CRF-AL.
          </p>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16">
        <div className="bg-white rounded-xl border border-crfal-gray-200 p-6 md:p-10 space-y-8 text-neutral-700">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Coleta de Dados</h2>
            <p>
              O CRF-AL pode coletar dados pessoais fornecidos diretamente pelo usuário em formulários, requerimentos, contatos e serviços digitais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Finalidade do Tratamento</h2>
            <p>
              Os dados são utilizados para atendimento de solicitações, execução de serviços institucionais, cumprimento de obrigações legais e comunicação com profissionais e cidadãos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">3. Compartilhamento de Dados</h2>
            <p>
              O compartilhamento ocorre somente quando necessário para execução de atividades institucionais, cumprimento legal, ordem judicial ou com consentimento do titular, quando aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">4. Direitos do Titular</h2>
            <p>
              Nos termos da LGPD (Lei n.º 13.709/2018), o titular pode solicitar confirmação de tratamento, acesso, correção, anonimização, eliminação e outras medidas cabíveis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">5. Segurança da Informação</h2>
            <p>
              O CRF-AL adota medidas técnicas e administrativas para proteção dos dados pessoais contra acessos não autorizados, perda, alteração ou divulgação indevida.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">6. Contato</h2>
            <p>
              Para solicitações relacionadas à privacidade e proteção de dados, entre em contato pelo e-mail
              {' '}
              <a className="text-crfal-blue hover:underline" href="mailto:atendimento@crf-al.org.br">
                atendimento@crf-al.org.br
              </a>.
            </p>
          </section>

          <p className="text-sm text-crfal-gray-500">
            Última atualização: 29 de maio de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
