import { Outlet, ScrollRestoration } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Popup from '@/components/ui/popup';

export default function Layout() {
  return (
    <div className="site-background min-h-screen text-[#1E293B]">
      <ScrollRestoration />
      <Header />
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <Footer />
      <Popup />
    </div>
  );
}
