import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';

// Lazy load all route pages for code splitting (bundle-dynamic-imports)
const HomePage = lazy(() => import('./pages/HomePage'));
const Instituicao = lazy(() => import('./pages/instituicao/Instituicao'));
const Historia = lazy(() => import('./pages/instituicao/Historia'));
const MissaoVisao = lazy(() => import('./pages/instituicao/MissaoVisao'));
const Diretoria = lazy(() => import('./pages/instituicao/Diretoria'));
const SobreConselho = lazy(() => import('./pages/instituicao/SobreConselho'));
const Estatuto = lazy(() => import('./pages/instituicao/Estatuto'));
const Contato = lazy(() => import('./pages/contato/Contato'));
const Requerimentos = lazy(() => import('./pages/servicos/Requerimentos'));
const Tutoriais = lazy(() => import('./pages/servicos/Tutoriais'));
const Ouvidoria = lazy(() => import('./pages/servicos/Ouvidoria'));
const Noticias = lazy(() => import('./pages/imprensa/Noticias'));
const NoticiaDetalhe = lazy(() => import('./pages/imprensa/NoticiaDetalhe'));

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin w-8 h-8 border-4 border-crfal-blue border-t-transparent rounded-full" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="instituicao" element={<Instituicao />} />
            <Route path="instituicao/sobre-conselho" element={<SobreConselho />} />
            <Route path="instituicao/historia" element={<Historia />} />
            <Route path="instituicao/missao-visao" element={<MissaoVisao />} />
            <Route path="instituicao/diretoria" element={<Diretoria />} />
            <Route path="instituicao/estatuto" element={<Estatuto />} />
            <Route path="servicos/requerimentos" element={<Requerimentos />} />
            <Route path="servicos/tutoriais" element={<Tutoriais />} />
            <Route path="servicos/ouvidoria" element={<Ouvidoria />} />
            <Route path="imprensa/noticias" element={<Noticias />} />
            <Route path="imprensa/noticias/:id" element={<NoticiaDetalhe />} />
            <Route path="todas-noticias" element={<Noticias />} />
            <Route path="contato" element={<Contato />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
