import React, { useState } from 'react';
import { Settings, Plus, Edit, Trash2, DollarSign, Calendar, Users, AlertCircle } from 'lucide-react';

interface Service {
  id: string;
  nom: string;
  description: string;
  montant: number;
  type: 'allocation' | 'pret';
  conditions: string[];
  actif: boolean;
  dateCreation: string;
}

export function GestionServices() {
  const [services, setServices] = useState<Service[]>([
    {
      id: '1',
      nom: 'Allocation Mariage',
      description: 'Aide financière pour les frais de mariage',
      montant: 50000,
      type: 'allocation',
      conditions: ['Être membre depuis au moins 6 mois', 'Fournir un certificat de mariage'],
      actif: true,
      dateCreation: '2023-01-01'
    },
    {
      id: '2',
      nom: 'Allocation Naissance',
      description: 'Aide financière pour l\'arrivée d\'un nouveau-né',
      montant: 25000,
      type: 'allocation',
      conditions: ['Être membre actif', 'Fournir un acte de naissance'],
      actif: true,
      dateCreation: '2023-01-01'
    },
    {
      id: '3',
      nom: 'Allocation Décès',
      description: 'Aide financière pour les frais funéraires',
      montant: 75000,
      type: 'allocation',
      conditions: ['Être membre ou ayant droit', 'Fournir un acte de décès'],
      actif: true,
      dateCreation: '2023-01-01'
    },
    {
      id: '4',
      nom: 'Prêt Social',
      description: 'Prêt pour les urgences sociales',
      montant: 100000,
      type: 'pret',
      conditions: ['Être membre depuis au moins 1 an', 'Avoir un garant', 'Remboursement sur 12 mois'],
      actif: true,
      dateCreation: '2023-01-01'
    },
    {
      id: '5',
      nom: 'Prêt Économique',
      description: 'Prêt pour les activités génératrices de revenus',
      montant: 200000,
      type: 'pret',
      conditions: ['Être membre depuis au moins 2 ans', 'Présenter un business plan', 'Remboursement sur 24 mois'],
      actif: false,
      dateCreation: '2023-01-01'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const toggleServiceStatus = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId 
        ? { ...service, actif: !service.actif }
        : service
    ));
  };

  const deleteService = (serviceId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      setServices(prev => prev.filter(service => service.id !== serviceId));
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'allocation' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getTypeLabel = (type: string) => {
    return type === 'allocation' ? 'Allocation' : 'Prêt';
  };

  const stats = {
    total: services.length,
    actifs: services.filter(s => s.actif).length,
    allocations: services.filter(s => s.type === 'allocation').length,
    prets: services.filter(s => s.type === 'pret').length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des services</h1>
          <p className="text-gray-600">Configurez les services offerts par la mutuelle ({stats.total} services)</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau service
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total services</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Services actifs</p>
              <p className="text-3xl font-bold text-green-600">{stats.actifs}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Settings className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Allocations</p>
              <p className="text-3xl font-bold text-blue-600">{stats.allocations}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Prêts</p>
              <p className="text-3xl font-bold text-green-600">{stats.prets}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Liste des services */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Services configurés</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {services.map((service) => (
            <div key={service.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-medium text-gray-900">{service.nom}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(service.type)}`}>
                      {getTypeLabel(service.type)}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      service.actif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {service.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {service.montant.toLocaleString()} FCFA
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Créé le {new Date(service.dateCreation).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions d'éligibilité :</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {service.conditions.map((condition, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {condition}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  <button
                    onClick={() => setEditingService(service)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Modifier
                  </button>
                  
                  <button
                    onClick={() => toggleServiceStatus(service.id)}
                    className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md transition-colors ${
                      service.actif 
                        ? 'text-red-700 bg-red-100 hover:bg-red-200' 
                        : 'text-green-700 bg-green-100 hover:bg-green-200'
                    }`}
                  >
                    {service.actif ? 'Désactiver' : 'Activer'}
                  </button>
                  
                  <button
                    onClick={() => deleteService(service.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avertissement pour les services inactifs */}
      {services.some(s => !s.actif) && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800 mb-1">Services inactifs détectés</h3>
              <p className="text-sm text-yellow-700">
                Certains services sont actuellement inactifs et ne sont pas disponibles pour les membres. 
                Activez-les pour permettre aux membres de soumettre des demandes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}