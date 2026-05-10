import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Auth Features
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import ForgotPassword from './features/auth/ForgotPassword';

// Import Main Features
import InstitutionManager from './features/admin/InstitutionManager';
import SchoolReport from './features/attendance/SchoolReport';
import PPDDashboard from './features/ppd-review/PPDDashboard';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
  
        {/* Protected Teacher Route */}
        <Route path="/attendance/report" element={
            <ProtectedRoute allowedRoles={['guru', 'ppd', 'superadmin']}>
            <SchoolReport />
        </ProtectedRoute>
        } />

        {/* Protected PPD Route */}
        <Route path="/ppd/dashboard" element={
            <ProtectedRoute allowedRoles={['ppd', 'superadmin']}>
            <PPDDashboard />
        </ProtectedRoute>
        } />

        {/* Protected Admin Route */}
        <Route path="/admin/institusi" element={
            <ProtectedRoute allowedRoles={['superadmin']}>
        <InstitutionManager />
            </ProtectedRoute>
        } />
        </Routes>
    </Router>
  );
}

export default App;