import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Toaster } from 'sonner';
import { Menu } from 'lucide-react';
import { Button } from '../ui/Button';
import NawrasLogo from '../brand/NawrasLogo';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F6F4]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:mr-72">
        <header className="sticky top-0 z-30 glass border-b border-[#E9E5E3] px-4 py-3 flex items-center gap-3 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} icon={Menu} />
          <NawrasLogo size="sm" className="w-9 h-9 shadow-[0_8px_20px_rgba(19,45,66,0.14)]" />
          <h2 className="font-bold text-[#153751]">عيادة النورس</h2>
        </header>
        <main className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
      <Toaster
        position="top-left"
        richColors
        closeButton
        dir="rtl"
        toastOptions={{
          style: {
            fontFamily: 'IBM Plex Sans Arabic, Cairo, sans-serif',
            borderRadius: '16px',
          },
        }}
      />
    </div>
  );
}
