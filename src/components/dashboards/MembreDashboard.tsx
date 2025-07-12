import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDemandes } from '../../contexts/DemandeContext';
import { useFamille } from '../../contexts/FamilleContext';
import { TestErrorComponent } from '../TestErrorComponent';
import { 
  Plus, 
  FileText, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  History,
  UserPlus
} from 'lucide-react';
import { DemandeFormData } from '../../types';


export function MembreDashboard() {
  const { user } = useAuth();
  const { getDemandesByRole } = useDemandes();
  const { getMembresFamilleByMembre } = useFamille();
  const navigate = useNavigate();
  
  const mesDemandes = getDemandesByRole('membre', user?.id);
  const membresFamille = user ? getMembresFamilleByMembre(user.id) : [];


  const stats = {
    soumises: mesDemandes.length,
    enAttente: mesDemandes.filter(d => d.statut === 'en_attente').length,
    approuvees: mesDemandes.filter(d => d.statut === 'acceptee' || d.statut === 'validee').length,
    membresFamille: membresFamille.length
  };

  const statsCards = [
    {
      title: 'Demandes soumises',
      value: stats.soumises,
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'En attente',
      value: stats.enAttente,
      icon: Clock,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    },
    {
      title: 'Approuvées',
      value: stats.approuvees,
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Membres famille',
      value: stats.membresFamille,
      icon: Users,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ];

  const actionCards = [
    {
      title: 'Nouvelle demande',
      description: 'Soumettre une demande de service',
      icon: FileText,
      iconColor: 'text-blue-600',
      action: () => navigate('/membre/demande')
    },
    {
      title: 'Gérer la famille',
      description: 'Ajouter ou modifier les membres',
      icon: UserPlus,
      iconColor: 'text-green-600',
      action: () => navigate('/membre/famille')
    },
    {
      title: 'Voir l\'historique',
      description: 'Consulter vos demandes passées',
      icon: History,
      iconColor: 'text-purple-600',
      action: () => navigate('/membre/historique')
    }
  ];


  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600">Bienvenue sur votre espace personnel MuSAIB, Jean Dupont</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{stat.title}</p>
                <p className="text-xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-2 sm:p-3 rounded-full ${stat.iconBg}`}>
                <stat.icon className={`w-4 h-4 sm:w-6 sm:h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Demandes récentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Demandes récentes</h3>
            <button 
              onClick={() => navigate('/membre/historique')}
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
            >
              Voir tout
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {mesDemandes.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <FileText className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-sm sm:text-base text-gray-500 mb-4">Aucune demande trouvée</p>
                <button
                  onClick={() => navigate('/membre/demande')}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouvelle demande
                </button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {mesDemandes.slice(0, 3).map((demande) => (
                  <div key={demande.id} className="flex items-start sm:items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {demande.type === 'mariage' ? 'Allocation Mariage' :
                         demande.type === 'naissance' ? 'Allocation Naissance' :
                         demande.type === 'deces' ? 'Allocation Décès' :
                         demande.type === 'pret_social' ? 'Prêt Social' :
                         'Prêt Économique'} - {demande.beneficiaireNom}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        {new Date(demande.dateSoumission).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                      demande.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                      demande.statut === 'acceptee' ? 'bg-blue-100 text-blue-800' :
                      demande.statut === 'validee' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      <span className="hidden sm:inline">
                        {demande.statut === 'en_attente' ? 'En attente' :
                         demande.statut === 'acceptee' ? 'Acceptée' :
                         demande.statut === 'validee' ? 'Validée' : 'Rejetée'}
                      </span>
                      <span className="sm:hidden">
                        {demande.statut === 'en_attente' ? 'Attente' :
                         demande.statut === 'acceptee' ? 'OK' :
                         demande.statut === 'validee' ? 'Validée' : 'KO'}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">Actions rapides</h3>
          </div>
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
            {actionCards.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className="w-full flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
              >
                <div className="flex-shrink-0 mr-3 sm:mr-4">
                  <action.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${action.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate">{action.title}</h4>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{action.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Composant de test d'erreurs (dev uniquement) */}
      <TestErrorComponent />
    </div>
  );
}