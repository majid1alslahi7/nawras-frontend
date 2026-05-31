import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { LayoutDashboard, Users, Calendar, Stethoscope, FlaskConical, Pill, Banknote, BarChart3, Settings, LogOut, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const menuItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم', roles: ['doctor', 'nurse', 'admin'] },
  { to: '/patients', icon: Users, label: 'المرضى', roles: ['doctor', 'nurse', 'admin'] },
  { to: '/appointments', icon: Calendar, label: 'المواعيد', roles: ['doctor', 'nurse', 'admin'] },
  { to: '/visits', icon: Stethoscope, label: 'الكشوفات', roles: ['doctor', 'nurse', 'admin'] },
  { to: '/lab', icon: FlaskConical, label: 'الفحوصات', roles: ['doctor', 'nurse', 'admin'] },
  { to: '/prescriptions', icon: Pill, label: 'الوصفات', roles: ['doctor', 'nurse', 'admin'] },
  { to: '/transactions', icon: Banknote, label: 'المالية', roles: ['nurse', 'admin'] },
  { to: '/reports', icon: BarChart3, label: 'التقارير', roles: ['doctor', 'nurse', 'admin'] },
  { to: '/settings', icon: Settings, label: 'الإعدادات', roles: ['admin'] },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const roleConfig = {
    doctor: { label: 'طبيبة', color: 'text-blue-200', bg: 'bg-blue-400/20' },
    nurse: { label: 'ممرضة', color: 'text-green-200', bg: 'bg-green-400/20' },
    admin: { label: 'مدير', color: 'text-amber-200', bg: 'bg-amber-400/20' },
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));
  const rc = roleConfig[user?.role] || roleConfig.nurse;

  return (
    <>
      {open && <div className="fixed inset-0 bg-[#0F2B40]/30 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        'fixed right-0 top-0 h-full w-72 z-50 transform transition-transform duration-300 lg:translate-x-0 flex flex-col',
        'bg-gradient-to-b from-[#153751] via-[#153751] to-[#0F2B40]',
        open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/15 backdrop-blur rounded-2xl flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-2xl" style={{ fontFamily: 'serif' }}>ن</span>
            </div>
            <div>
              <h1 className="font-bold text-white text-base">عيادة نورس</h1>
              <p className="text-xs text-white/50">رعايتكم رسالتنا</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/70 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${rc.bg} rounded-xl flex items-center justify-center`}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{user?.full_name}</p>
              <p className={`text-xs ${rc.color}`}>{rc.label}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200',
                isActive
                  ? 'bg-white text-[#153751] font-semibold shadow-lg'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 transition-all cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
