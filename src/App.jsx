import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
import { useEffect, useState } from 'react';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import VisitsPage from './pages/visits/VisitsPage';
import LabPage from './pages/lab/LabPage';
import PrescriptionsPage from './pages/prescriptions/PrescriptionsPage';
import TransactionsPage from './pages/transactions/TransactionsPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import api from './services/api';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30000 } },
});

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user, token } = useAuthStore();

  if (!token || !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated, token } = useAuthStore();

  if (token && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const { token, logout } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      if (token) {
        try {
          await api.get('/me');
        } catch (error) {
          if (error.response?.status === 401) {
            logout();
          }
        }
      }
      setChecking(false);
    };
    verifySession();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F6F4]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#153751] to-[#1E5A78] rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-3xl" style={{ fontFamily: 'serif' }}>ن</span>
          </div>
          <p className="text-[#7E8991]">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          </Route>

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/visits" element={<VisitsPage />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/transactions" element={<ProtectedRoute roles={['nurse', 'admin']}><TransactionsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<ProtectedRoute roles={['admin']}><SettingsPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
