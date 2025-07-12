import React from 'react';
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
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export function Sidebar({ userRole = 'administrateur', activeView = 'dashboard', onViewChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
    { icon: Users, label: 'Gestion des adhérents', view: 'adherents' },
    { icon: Upload, label: 'Importation utilisateurs', view: 'import' },
    { icon: FileText, label: 'Gestion des demandes', view: 'demandes' },
    { icon: Settings, label: 'Gestion des services', view: 'services' },
    { icon: FileBarChart, label: 'Logs & Audit', view: 'logs' },
  ];

  const memberMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', view: 'dashboard' },
    { icon: UserPlus, label: 'Informations familiales', view: 'famille' },
    { icon: FileText, label: 'Demande de service', view: 'demande' },
    { icon: History, label: 'Historique', view: 'historique' },
  ];

  const menuItems = userRole === 'membre' ? memberMenuItems : adminMenuItems;
  const sidebarTitle = userRole === 'membre' ? 'MuSAIB' : 'MuSAIB Admin';

  const handleMenuClick = (view: string) => {
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="flex w-64 flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex h-16 items-center px-6 bg-blue-600">
        <Shield className="h-8 w-8 text-white mr-3" />
        <span className="text-xl font-bold text-white">{sidebarTitle}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleMenuClick(item.view)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeView === item.view
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className={`mr-3 h-5 w-5 ${activeView === item.view ? 'text-blue-600' : 'text-gray-400'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {userRole === 'membre' ? 'Jean Dupont' : 'Administrateur de MuSAIB'}
            </p>
            <p className="text-xs text-gray-500">
              {userRole === 'membre' ? 'membre@musaib.com' : 'admin@musaib.com'}
            </p>
          </div>
        </div>
        
        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
          <User className="mr-3 h-4 w-4" />
          Mon compte
        </button>
        
        <button 
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-2"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );
}