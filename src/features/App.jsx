import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../lib/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Auth
import Login          from './auth/Login';
import Register       from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';

// Features
import SchoolReport      from './attendance/SchoolReport';
import PPDDashboard      from './ppd-review/PPDDashboard';
import InstitutionManager from './admin/InstitutionManager';

const Unauthorized = () => (
  <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
    <div className="text-center">
      <p className="text-5xl font-black text-teal-500 mb-3">403</p>
      <p className="text-white font-bold mb-1">Akses Ditolak</p>
      <p className="text-white/40 text-sm">Anda tidak mempunyai kebenaran untuk halaman ini.</p>
      <a href="/login" className="mt-6 inline-block text-teal-400 text-sm font-bold hover:underline">
        ← Kembali ke Log Masuk
      </a>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/login"          element={<Login />} />
          <Route path="/register"       element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized"   element={<Unauthorized />} />
          <Route path="/"               element={<Navigate to="/login" replace />} />

          {/* Guru + PPD + Superadmin */}
          <Route
            path="/attendance/report"
            element={
              <ProtectedRoute allowedRoles={['guru','ppd','superadmin']}>
                <SchoolReport />
              </ProtectedRoute>
            }
          />

          {/* PPD + Superadmin */}
          <Route
            path="/ppd/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ppd','superadmin']}>
                <PPDDashboard />
              </ProtectedRoute>
            }
          />

          {/* Superadmin only */}
          <Route
            path="/admin/institusi"
            element={
              <ProtectedRoute allowedRoles={['superadmin']}>
                <InstitutionManager />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
