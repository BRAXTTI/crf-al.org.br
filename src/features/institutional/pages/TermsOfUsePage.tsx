import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-crfal-gray-50">
      <SEO
        title="Termos de Uso"
        description="Termos de Uso do site CRFAL — condições gerais de uso do portal do Conselho Regional de Farmácia do Estado de Alagoas."
        path="/termos-de-uso"
        noindex
      />
      <PageHero
        breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Termos de Uso' }]}
        title="Termos de Uso"
      />

      <div className="container-crfal py-10 md:py-16">
        <div className="bg-white rounded-xl border border-crfal-gray-200 p-6 md:p-10 space-y-8 text-neutral-700">
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

          <p className="text-sm text-crfal-gray-500">
            Última atualização: 29 de maio de 2026.
          </p>
        </div>
      </div>
    </div>
  );
}
