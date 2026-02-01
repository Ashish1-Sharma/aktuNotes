import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Toaster } from '@/components/ui/sonner';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import BranchPage from '@/pages/public/BranchPage';
import YearPage from '@/pages/public/YearPage';
import SubjectNotesPage from '@/pages/public/SubjectNotesPage';
import SearchPage from '@/pages/public/SearchPage';

// Admin Pages
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminUpload from '@/pages/admin/AdminUpload';
import AdminManageNotes from '@/pages/admin/AdminManageNotes';

// Admin Layout
import AdminLayout from '@/components/admin/AdminLayout';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/branch/:branchId" element={<BranchPage />} />
          <Route path="/branch/:branchId/year/:year" element={<YearPage />} />
          <Route path="/subject/:subjectId/notes" element={<SubjectNotesPage />} />
          <Route path="/search" element={<SearchPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="upload-notes" element={<AdminUpload />} />
            <Route path="manage-notes" element={<AdminManageNotes />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

export default App;
