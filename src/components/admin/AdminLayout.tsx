import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Upload Notes',
      path: '/admin/upload-notes',
      icon: Upload
    },
    {
      name: 'Manage Notes',
      path: '/admin/manage-notes',
      icon: FileText
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-slate-900 text-white transition-all duration-300 ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <Link to="/admin/dashboard" className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            {isSidebarOpen && (
              <div>
                <span className="font-semibold">Admin</span>
                <span className="text-xs text-slate-400 block">Panel</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isSidebarOpen && (
                  <span className="font-medium">{item.name}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800">
          {isSidebarOpen && (
            <div className="mb-4 px-3">
              <p className="text-sm text-slate-400">Logged in as</p>
              <p className="text-sm font-medium truncate">{currentUser?.email}</p>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {isSidebarOpen && 'Logout'}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center text-sm text-gray-500">
            <span className="hover:text-gray-700 cursor-pointer">Admin</span>
            <ChevronRight className="h-4 w-4 mx-2" />
            <span className="text-gray-900 font-medium">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" target="_blank">
              <Button variant="outline" size="sm">
                View Website
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
