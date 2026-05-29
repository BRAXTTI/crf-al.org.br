import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/features/home/pages/HomePage';
import InstitutionalPage from '@/features/institutional/pages/InstitutionalPage';
import SobreConselhoPage from '@/features/institutional/pages/SobreConselhoPage';
import MissionVisionPage from '@/features/institutional/pages/MissionVisionPage';
import BoardPage from '@/features/institutional/pages/BoardPage';
import StatutePage from '@/features/institutional/pages/StatutePage';
import PrivacyPolicyPage from '@/features/institutional/pages/PrivacyPolicyPage';
import TermsOfUsePage from '@/features/institutional/pages/TermsOfUsePage';
import ContactPage from '@/features/contact/pages/ContactPage';
import RequirementsPage from '@/features/services/pages/RequirementsPage';
import TutorialsPage from '@/features/services/pages/TutorialsPage';
import OmbudsmanPage from '@/features/services/pages/OmbudsmanPage';
import NewsPage from '@/features/press/pages/NewsPage';
import NewsDetailPage from '@/features/press/pages/NewsDetailPage';
import PublicationDetailPage from '@/features/publications/pages/PublicationDetailPage';
import FiscalizacaoPage from '@/features/fiscalizacao/pages/FiscalizacaoPage';
import PapelFiscalizacaoPage from '@/features/fiscalizacao/pages/PapelFiscalizacaoPage';
import InstrumentosFiscalizacaoPage from '@/features/fiscalizacao/pages/InstrumentosFiscalizacaoPage';
import PlanoFiscalizacaoAnualPage from '@/features/fiscalizacao/pages/PlanoFiscalizacaoAnualPage';
import RelatoriosFiscalizacaoPage from '@/features/fiscalizacao/pages/RelatoriosFiscalizacaoPage';
import ProcessoAdministrativoFiscalPage from '@/features/fiscalizacao/pages/ProcessoAdministrativoFiscalPage';
import AfastamentoProvisorioPage from '@/features/fiscalizacao/pages/AfastamentoProvisorioPage';
import LegislacaoPage from '@/features/fiscalizacao/pages/LegislacaoPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="instituicao" element={<InstitutionalPage />} />
          <Route path="instituicao/sobre-conselho" element={<SobreConselhoPage />} />
          <Route path="instituicao/missao-visao" element={<MissionVisionPage />} />
          <Route path="instituicao/diretoria" element={<BoardPage />} />
          <Route path="instituicao/estatuto" element={<StatutePage />} />
          <Route path="politica-de-privacidade" element={<PrivacyPolicyPage />} />
          <Route path="termos-de-uso" element={<TermsOfUsePage />} />
          <Route path="servicos/requerimentos" element={<RequirementsPage />} />
          <Route path="servicos/tutoriais" element={<TutorialsPage />} />
          <Route path="servicos/ouvidoria" element={<OmbudsmanPage />} />
          <Route path="imprensa/noticias" element={<NewsPage />} />
          <Route path="imprensa/noticias/:id" element={<NewsDetailPage />} />
          <Route path="contato" element={<ContactPage />} />
          <Route path="publicacao/:slug" element={<PublicationDetailPage />} />
          <Route path="fiscalizacao" element={<FiscalizacaoPage />} />
          <Route path="fiscalizacao/papel-da-fiscalizacao" element={<PapelFiscalizacaoPage />} />
          <Route path="fiscalizacao/instrumentos-da-fiscalizacao" element={<InstrumentosFiscalizacaoPage />} />
          <Route path="fiscalizacao/plano-de-fiscalizacao-anual" element={<PlanoFiscalizacaoAnualPage />} />
          <Route path="fiscalizacao/relatorios" element={<RelatoriosFiscalizacaoPage />} />
          <Route path="fiscalizacao/processo-administrativo-fiscal" element={<ProcessoAdministrativoFiscalPage />} />
          <Route path="fiscalizacao/afastamento-provisorio" element={<AfastamentoProvisorioPage />} />
          <Route path="legislacao" element={<LegislacaoPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
