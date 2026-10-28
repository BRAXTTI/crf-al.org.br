import { useEffect, useRef } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import HashScroll from './HashScroll';
import Popup from '@/components/ui/popup';
import ToastsGate from '@/features/notificacoes/ToastsGate';

export default function Layout() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      document.getElementById('conteudo')?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);
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
      <ToastsGate />
    </div>
  );
}
