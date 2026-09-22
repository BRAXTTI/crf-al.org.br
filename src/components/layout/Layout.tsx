import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Popup from '@/components/ui/popup';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <Popup />
    </div>
  );
}
