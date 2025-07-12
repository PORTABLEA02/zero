import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MembreDashboard } from './dashboards/MembreDashboard';
import { ControleurDashboard } from './dashboards/ControleurDashboard';
import { AdministrateurDashboard } from './dashboards/AdministrateurDashboard';

interface DashboardProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
}

export function Dashboard({ activeView, onViewChange }: DashboardProps) {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'membre':
      return <MembreDashboard activeView={activeView} onViewChange={onViewChange} />;
    case 'controleur':
      return <ControleurDashboard />;
    case 'administrateur':
      return <AdministrateurDashboard activeView={activeView} />;
    default:
      return <div>Rôle non reconnu</div>;
  }
}