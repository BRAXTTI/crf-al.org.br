import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Instituicao from './pages/instituicao/Instituicao';
import Historia from './pages/instituicao/Historia';
import MissaoVisao from './pages/instituicao/MissaoVisao';
import Diretoria from './pages/instituicao/Diretoria';
import Estatuto from './pages/instituicao/Estatuto';
import Contato from './pages/contato/Contato';
import Requerimentos from './pages/servicos/Requerimentos';
import Tutoriais from './pages/servicos/Tutoriais';
import Ouvidoria from './pages/servicos/Ouvidoria';
import Noticias from './pages/imprensa/Noticias';
import NoticiaDetalhe from './pages/imprensa/NoticiaDetalhe';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="instituicao" element={<Instituicao />} />
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
    </BrowserRouter>
  );
}

export default App;
