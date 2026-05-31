import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './store/authStore';
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

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 30000 } },
});

function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
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
            <Route path="/visits" element={<ProtectedRoute roles={['doctor']}><VisitsPage /></ProtectedRoute>} />
            <Route path="/lab" element={<ProtectedRoute roles={['doctor', 'nurse']}><LabPage /></ProtectedRoute>} />
            <Route path="/prescriptions" element={<ProtectedRoute roles={['doctor']}><PrescriptionsPage /></ProtectedRoute>} />
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
