import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/features/home/pages/HomePage';
import InstitutionalPage from '@/features/institutional/pages/InstitutionalPage';
import HistoryPage from '@/features/institutional/pages/HistoryPage';
import MissionVisionPage from '@/features/institutional/pages/MissionVisionPage';
import BoardPage from '@/features/institutional/pages/BoardPage';
import StatutePage from '@/features/institutional/pages/StatutePage';
import ContactPage from '@/features/contact/pages/ContactPage';
import RequirementsPage from '@/features/services/pages/RequirementsPage';
import TutorialsPage from '@/features/services/pages/TutorialsPage';
import OmbudsmanPage from '@/features/services/pages/OmbudsmanPage';
import NewsPage from '@/features/press/pages/NewsPage';
import PublicationDetailPage from '@/features/publications/pages/PublicationDetailPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="instituicao" element={<InstitutionalPage />} />
          <Route path="instituicao/historia" element={<HistoryPage />} />
          <Route path="instituicao/missao-visao" element={<MissionVisionPage />} />
          <Route path="instituicao/diretoria" element={<BoardPage />} />
          <Route path="instituicao/estatuto" element={<StatutePage />} />
          <Route path="servicos/requerimentos" element={<RequirementsPage />} />
          <Route path="servicos/tutoriais" element={<TutorialsPage />} />
          <Route path="servicos/ouvidoria" element={<OmbudsmanPage />} />
          <Route path="imprensa/noticias" element={<NewsPage />} />
          <Route path="contato" element={<ContactPage />} />
          <Route path="publicacao/:slug" element={<PublicationDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
