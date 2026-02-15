import { Outlet } from 'react-router-dom';
import Header from './sections/Header';
import Footer from './sections/Footer';

export default function Layout() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
