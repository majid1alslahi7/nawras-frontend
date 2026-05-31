import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F6F4] p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 L55 30 L30 55 L5 30Z' fill='none' stroke='%23153751' stroke-width='1'/%3E%3C/svg%3E\")" }}
      />
      <div className="absolute top-10 right-10 w-72 h-72 bg-[#153751]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#1E5A78]/5 rounded-full blur-3xl" />
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
