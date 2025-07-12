import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Upload, 
  FileText, 
  Settings, 
  FileBarChart,
  User,
  LogOut,
  Shield,
  UserPlus,
  Clock,
  History
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = 'administrateur' }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Gestion des adhérents', path: '/admin/adherents' },
    { icon: Upload, label: 'Importation utilisateurs', path: '/admin/import' },
    { icon: FileText, label: 'Gestion des demandes', path: '/admin/demandes' },
    { icon: Settings, label: 'Gestion des services', path: '/admin/services' },
    { icon: FileBarChart, label: 'Logs & Audit', path: '/admin/logs' },
  ];

  const memberMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: UserPlus, label: 'Informations familiales', path: '/membre/famille' },
    { icon: FileText, label: 'Demande de service', path: '/membre/demande' },
    { icon: History, label: 'Historique', path: '/membre/historique' },
  ];

  const menuItems = userRole === 'membre' ? memberMenuItems : adminMenuItems;
  const sidebarTitle = userRole === 'membre' ? 'MuSAIB' : 'MuSAIB Admin';

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname === path;
  };
  return (
    <div className="flex w-64 flex-col bg-white border-r border-gray-200 h-full">
      {/* Header */}
      <div className="flex h-16 items-center px-6 bg-blue-600">
        <Shield className="h-8 w-8 text-white mr-3" />
        <span className="text-lg sm:text-xl font-bold text-white truncate">{sidebarTitle}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleMenuClick(item.path)}
            className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-400'}`} />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center mb-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-3 min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userRole === 'membre' ? 'Jean Dupont' : 'Administrateur de MuSAIB'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userRole === 'membre' ? 'membre@musaib.com' : 'admin@musaib.com'}
            </p>
          </div>
        </div>
        
        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors mb-2">
          <User className="mr-3 h-4 w-4" />
          <span className="truncate">Mon compte</span>
        </button>
        
        <button 
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          <span className="truncate">Déconnexion</span>
        </button>
      </div>
    </div>
  );
}