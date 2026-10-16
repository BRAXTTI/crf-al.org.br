import type { ComponentType } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import HomePage from '@/features/home/pages/HomePage';
import NotFoundPage from '@/features/not-found/pages/NotFoundPage';

/** Rota carregada sob demanda: cada página vira um chunk próprio. */
const page = (load: () => Promise<{ default: ComponentType }>) => async () => ({ Component: (await load()).default });

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    // Primeira visita direto numa rota lazy: nada a mostrar até o chunk chegar.
    HydrateFallback: () => null,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'instituicao', lazy: page(() => import('@/features/institutional/pages/InstitutionalPage')) },
      { path: 'instituicao/sobre-conselho', lazy: page(() => import('@/features/institutional/pages/SobreConselhoPage')) },
      { path: 'instituicao/missao-visao', element: <Navigate to="/instituicao/sobre-conselho" replace /> },
      { path: 'instituicao/diretoria', lazy: page(() => import('@/features/institutional/pages/BoardPage')) },
      { path: 'instituicao/estatuto', lazy: page(() => import('@/features/institutional/pages/StatutePage')) },
      { path: 'instituicao/plenarias', lazy: page(() => import('@/features/institutional/pages/PlenariasPage')) },
      { path: 'politica-de-privacidade', lazy: page(() => import('@/features/institutional/pages/PrivacyPolicyPage')) },
      { path: 'termos-de-uso', lazy: page(() => import('@/features/institutional/pages/TermsOfUsePage')) },
      { path: 'servicos/requerimentos', lazy: page(() => import('@/features/services/pages/RequirementsPage')) },
      { path: 'servicos/tutoriais', lazy: page(() => import('@/features/services/pages/TutorialsPage')) },
      { path: 'servicos/manual-crf-em-casa', lazy: page(() => import('@/features/services/pages/ManualCrfEmCasaPage')) },
      { path: 'servicos/ouvidoria', lazy: page(() => import('@/features/services/pages/OmbudsmanPage')) },
      { path: 'imprensa/noticias', lazy: page(() => import('@/features/press/pages/NewsPage')) },
      { path: 'imprensa/publicacoes-cff', lazy: page(() => import('@/features/press/pages/CffPublicationsPage')) },
      { path: 'imprensa/noticias-cff', element: <Navigate to="/imprensa/publicacoes-cff" replace /> },
      { path: 'imprensa/noticias/:slug', lazy: page(() => import('@/features/press/pages/NewsDetailPage')) },
      { path: 'imprensa/galeria-de-fotos', lazy: page(() => import('@/features/press/pages/PhotoGalleryPage')) },
      { path: 'imprensa/galeria-de-fotos/:slug', lazy: page(() => import('@/features/press/pages/PhotoAlbumPage')) },
      { path: 'contato', lazy: page(() => import('@/features/contact/pages/ContactPage')) },
      { path: 'publicacao/:slug', lazy: page(() => import('@/features/publications/pages/PublicationDetailPage')) },
      { path: 'fiscalizacao', lazy: page(() => import('@/features/fiscalizacao/pages/FiscalizacaoPage')) },
      { path: 'fiscalizacao/papel-da-fiscalizacao', lazy: page(() => import('@/features/fiscalizacao/pages/PapelFiscalizacaoPage')) },
      { path: 'fiscalizacao/instrumentos-da-fiscalizacao', lazy: page(() => import('@/features/fiscalizacao/pages/InstrumentosFiscalizacaoPage')) },
      { path: 'fiscalizacao/plano-de-fiscalizacao-anual', lazy: page(() => import('@/features/fiscalizacao/pages/PlanoFiscalizacaoAnualPage')) },
      { path: 'fiscalizacao/relatorios', lazy: page(() => import('@/features/fiscalizacao/pages/RelatoriosFiscalizacaoPage')) },
      { path: 'fiscalizacao/processo-administrativo-fiscal', lazy: page(() => import('@/features/fiscalizacao/pages/ProcessoAdministrativoFiscalPage')) },
      { path: 'fiscalizacao/afastamento-provisorio', lazy: page(() => import('@/features/fiscalizacao/pages/AfastamentoProvisorioPage')) },
      { path: 'legislacao', lazy: page(() => import('@/features/fiscalizacao/pages/LegislacaoPage')) },
      { path: 'eventos', lazy: page(() => import('@/features/events/pages/EventosPage')) },
      { path: 'eventos/:slug', lazy: page(() => import('@/features/events/pages/EventoDetailPage')) },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
