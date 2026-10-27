import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';
export default function AccessibilityPage() {
  return <div>
    <SEO title="Acessibilidade" description="Recursos de navegação por teclado e acessibilidade do portal CRF-AL." path="/acessibilidade" />
    <PageHero title="Acessibilidade" breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Acessibilidade' }]} />
    <section className="container-crfal space-y-4 py-12">
      <h2 className="text-xl font-bold">Navegação por teclado</h2>
      <p>Use Tab e Shift+Tab para percorrer os links e controles, Enter para ativá-los e Escape para fechar diálogos. O link “Ir para o conteúdo” aparece ao iniciar a navegação por teclado.</p>
      <p>A busca de páginas e serviços pode ser aberta com Ctrl+K ou Command+K. O portal respeita a preferência de redução de movimento do seu dispositivo.</p>
      <p>Use os controles do navegador para ampliar o texto e o conteúdo.</p>
      <p>Se encontrar uma barreira de acesso, <Link to="/contato" className="underline">entre em contato com o CRF-AL</Link> e informe a página e a dificuldade encontrada.</p>
    </section>
  </div>;
}
