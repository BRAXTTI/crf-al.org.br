import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import PageHero from '@/components/block/page-hero';
import { ESIC_URL, TRANSPARENCIA_URL } from '@/config/site';
export default function InformationAccessPage() {
  return <div>
    <SEO title="Acesso à Informação" description="Acesso ao Portal da Transparência, e-SIC e informações públicas do CRF-AL." path="/acesso-a-informacao" />
    <PageHero title="Acesso à Informação" breadcrumb={[{ label: 'Início', href: '/' }, { label: 'Acesso à Informação' }]} />
    <section className="container-crfal space-y-5 py-12">
      <h2 className="text-xl font-bold">Transparência e pedidos de informação</h2>
      <p><a className="underline" href={TRANSPARENCIA_URL} target="_blank" rel="noopener noreferrer">Consultar o Portal da Transparência (abre em nova aba)</a></p>
      <p><a className="underline" href={ESIC_URL} target="_blank" rel="noopener noreferrer">Registrar pedido de informação no e-SIC (abre em nova aba)</a></p>
      <h2 className="text-xl font-bold">Informações disponíveis no portal</h2>
      <ul className="space-y-3 underline">
        <li><Link to="/instituicao">Informações institucionais</Link></li>
        <li><Link to="/instituicao/plenarias">Plenárias</Link></li>
        <li><Link to="/fiscalizacao/relatorios">Relatórios de fiscalização</Link></li>
        <li><Link to="/legislacao">Legislação</Link></li>
        <li><Link to="/servicos/ouvidoria">Ouvidoria e orientação sobre os canais de atendimento</Link></li>
        <li><Link to="/politica-de-privacidade">Política de Privacidade</Link></li>
      </ul>
    </section>
  </div>;
}
