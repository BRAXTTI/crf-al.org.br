import { ChevronRight } from 'lucide-react';
import SEO from '@/components/SEO';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SEO
        title="Termos de Uso"
        description="Termos de Uso do site CRFAL — condições gerais de uso do portal do Conselho Regional de Farmácia de Alagoas."
        path="/termos-de-uso"
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
            <span className="text-white">Termos de Uso</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Termos de Uso</h1>
          <p className="text-white/80 text-lg max-w-3xl">
            Estes termos regulam o acesso e o uso dos serviços e conteúdos disponibilizados no site do CRF-AL.
          </p>
        </div>
      </div>

      <div className="container-crfal py-10 md:py-16">
        <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-10 space-y-8 text-neutral-700">
          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">1. Aceitação dos Termos</h2>
            <p>
              Ao acessar este site, o usuário declara ciência e concordância com estes termos e com a legislação aplicável.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">2. Uso Permitido</h2>
            <p>
              O uso deve ocorrer de forma lícita, ética e compatível com as finalidades institucionais do CRF-AL, sem violação de direitos de terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">3. Responsabilidades do Usuário</h2>
            <p>
              O usuário é responsável pelas informações fornecidas nos formulários e pela guarda de credenciais de acesso, quando houver.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">4. Propriedade Intelectual</h2>
            <p>
              Conteúdos, marcas, logotipos e materiais institucionais deste site são protegidos por legislação aplicável, vedado o uso indevido sem autorização.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">5. Limitação de Responsabilidade</h2>
            <p>
              O CRF-AL emprega esforços para manter as informações atualizadas, porém não se responsabiliza por indisponibilidades temporárias ou por uso inadequado da plataforma por terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">6. Alterações</h2>
            <p>
              Estes termos podem ser atualizados a qualquer momento para adequação legal, técnica ou institucional. Recomenda-se consulta periódica.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-neutral-900 mb-3">7. Contato</h2>
            <p>
              Em caso de dúvidas sobre estes termos, entre em contato pelo e-mail
              {' '}
              <a className="text-crfal-blue hover:underline" href="mailto:atendimento@crf-al.org.br">
                atendimento@crf-al.org.br
              </a>.
            </p>
          </section>

          <p className="text-sm text-neutral-500">
            Última atualização: 29 de maio de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
