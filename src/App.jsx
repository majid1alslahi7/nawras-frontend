import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './components/layout/MainLayout';
import AuthLayout from './components/layout/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import PatientsPage from './pages/patients/PatientsPage';
import PatientDetail from './pages/patients/PatientDetail';
import PatientForm from './pages/patients/PatientForm';
import AppointmentsPage from './pages/appointments/AppointmentsPage';
import VisitsPage from './pages/visits/VisitsPage';
import VisitForm from './pages/visits/VisitForm';
import LabPage from './pages/lab/LabPage';
import LabRequestForm from './pages/lab/LabRequestForm';
import LabResultForm from './pages/lab/LabResultForm';
import PrescriptionsPage from './pages/prescriptions/PrescriptionsPage';
import PrescriptionForm from './pages/prescriptions/PrescriptionForm';
import TransactionsPage from './pages/transactions/TransactionsPage';
import TransactionForm from './pages/transactions/TransactionForm';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('nawras-token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/patients/new" element={<PatientForm />} />
            <Route path="/patients/:id" element={<PatientDetail />} />
            <Route path="/patients/:id/edit" element={<PatientForm />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/visits" element={<VisitsPage />} />
            <Route path="/visits/new" element={<VisitForm />} />
            <Route path="/visits/:id/edit" element={<VisitForm />} />
            <Route path="/lab" element={<LabPage />} />
            <Route path="/lab/new" element={<LabRequestForm />} />
            <Route path="/lab/results/new" element={<LabResultForm />} />
            <Route path="/lab/results/new/:requestId" element={<LabResultForm />} />
            <Route path="/prescriptions" element={<PrescriptionsPage />} />
            <Route path="/prescriptions/new" element={<PrescriptionForm />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/new" element={<TransactionForm />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
