import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import HashScroll from './HashScroll';
import Popup from '@/components/ui/popup';

export default function Layout() {
  return (
    <div className="site-background min-h-screen text-[#1E293B]">
      <ScrollRestoration />
      <HashScroll />
      <Header />
      <main id="conteudo" tabIndex={-1} className="outline-hidden">
        <Outlet />
      </main>
      <Footer />
      <Popup />
    </div>
  );
}
