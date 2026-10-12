import React from 'react';
import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { AppProvider, useApp } from './store/AppContext';
import { Layout } from './components/layout/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudentsPage, StudentFormPage } from './pages/StudentsPage';
import { StudentProfilePage } from './pages/StudentProfilePage';
import { FeesPage } from './pages/FeesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function StudentEditWrapper() {
  const { id } = useParams<{ id: string }>();
  return <StudentFormPage editId={id} />;
}

function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/students" element={<ProtectedRoute><StudentsPage /></ProtectedRoute>} />
          <Route path="/students/add" element={<ProtectedRoute><StudentFormPage /></ProtectedRoute>} />
          <Route path="/students/:id" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />
          <Route path="/students/:id/edit" element={<ProtectedRoute><StudentEditWrapper /></ProtectedRoute>} />
          <Route path="/fees" element={<ProtectedRoute><FeesPage /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentsPage /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AppProvider>
  );
}

export default App;
