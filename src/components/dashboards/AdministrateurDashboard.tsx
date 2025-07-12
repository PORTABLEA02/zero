import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDemandes } from '../../contexts/DemandeContext';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  FileText,
  TrendingUp,
  BarChart3,
  Activity
} from 'lucide-react';


export function AdministrateurDashboard() {
  const { user } = useAuth();
  const { demandes } = useDemandes();


  // Calcul des statistiques
  const totalAdherents = 4; // Données simulées
  const demandesEnAttente = demandes.filter(d => d.statut === 'acceptee').length;
  const demandesTraitees = demandes.filter(d => d.statut === 'validee').length;
  const demandesCeMois = demandes.filter(d => {
    const date = new Date(d.dateSoumission);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const statsCards = [
    {
      title: 'Total adhérents',
      value: totalAdherents,
      change: '+0%',
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Demandes en attente',
      value: demandesEnAttente,
      change: '+0%',
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Demandes traitées',
      value: demandesTraitees,
      change: '+0%',
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Demandes ce mois',
      value: demandesCeMois,
      change: '+0%',
      icon: FileText,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Administrateur</h1>
        <p className="text-gray-600">Vue d'ensemble de la plateforme MuSAIB</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">
                  <TrendingUp className="inline w-4 h-4 mr-1" />
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Évolution des demandes */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution des demandes</h3>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          </div>
        </div>

        {/* Répartition par service */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par service</h3>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <div className="text-center">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Activité récente</h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center h-32 text-gray-400">
            <div className="text-center">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucune activité récente</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}