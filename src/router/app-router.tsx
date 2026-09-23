import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/features/home/pages/HomePage';
import InstitutionalPage from '@/features/institutional/pages/InstitutionalPage';
import SobreConselhoPage from '@/features/institutional/pages/SobreConselhoPage';
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
import EventosPage from '@/features/events/pages/EventosPage';
import EventoDetailPage from '@/features/events/pages/EventoDetailPage';
import NotFoundPage from '@/features/not-found/pages/NotFoundPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'instituicao', element: <InstitutionalPage /> },
      { path: 'instituicao/sobre-conselho', element: <SobreConselhoPage /> },
      { path: 'instituicao/missao-visao', element: <Navigate to="/instituicao/sobre-conselho" replace /> },
      { path: 'instituicao/diretoria', element: <BoardPage /> },
      { path: 'instituicao/estatuto', element: <StatutePage /> },
      { path: 'politica-de-privacidade', element: <PrivacyPolicyPage /> },
      { path: 'termos-de-uso', element: <TermsOfUsePage /> },
      { path: 'servicos/requerimentos', element: <RequirementsPage /> },
      { path: 'servicos/tutoriais', element: <TutorialsPage /> },
      { path: 'servicos/ouvidoria', element: <OmbudsmanPage /> },
      { path: 'imprensa/noticias', element: <NewsPage /> },
      { path: 'imprensa/noticias/:id', element: <NewsDetailPage /> },
      { path: 'contato', element: <ContactPage /> },
      { path: 'publicacao/:slug', element: <PublicationDetailPage /> },
      { path: 'fiscalizacao', element: <FiscalizacaoPage /> },
      { path: 'fiscalizacao/papel-da-fiscalizacao', element: <PapelFiscalizacaoPage /> },
      { path: 'fiscalizacao/instrumentos-da-fiscalizacao', element: <InstrumentosFiscalizacaoPage /> },
      { path: 'fiscalizacao/plano-de-fiscalizacao-anual', element: <PlanoFiscalizacaoAnualPage /> },
      { path: 'fiscalizacao/relatorios', element: <RelatoriosFiscalizacaoPage /> },
      { path: 'fiscalizacao/processo-administrativo-fiscal', element: <ProcessoAdministrativoFiscalPage /> },
      { path: 'fiscalizacao/afastamento-provisorio', element: <AfastamentoProvisorioPage /> },
      { path: 'legislacao', element: <LegislacaoPage /> },
      { path: 'eventos', element: <EventosPage /> },
      { path: 'eventos/:slug', element: <EventoDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
