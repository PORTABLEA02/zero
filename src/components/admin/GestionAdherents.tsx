import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Edit, Trash2, Mail, Phone, Calendar, MapPin } from 'lucide-react';

interface Adherent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  dateAdhesion: string;
  statut: 'actif' | 'inactif' | 'suspendu';
  service: string;
  adresse: string;
}

export function GestionAdherents() {
  const [adherents] = useState<Adherent[]>([
    {
      id: '1',
      nom: 'Dupont',
      prenom: 'Jean',
      email: 'jean.dupont@email.com',
      telephone: '+221 77 123 45 67',
      dateAdhesion: '2023-01-15',
      statut: 'actif',
      service: 'Informatique',
      adresse: 'Dakar, Sénégal'
    },
    {
      id: '2',
      nom: 'Martin',
      prenom: 'Marie',
      email: 'marie.martin@email.com',
      telephone: '+221 76 987 65 43',
      dateAdhesion: '2023-03-20',
      statut: 'actif',
      service: 'Comptabilité',
      adresse: 'Thiès, Sénégal'
    },
    {
      id: '3',
      nom: 'Diallo',
      prenom: 'Amadou',
      email: 'amadou.diallo@email.com',
      telephone: '+221 78 456 78 90',
      dateAdhesion: '2023-06-10',
      statut: 'inactif',
      service: 'Ressources Humaines',
      adresse: 'Saint-Louis, Sénégal'
    },
    {
      id: '4',
      nom: 'Ndiaye',
      prenom: 'Fatou',
      email: 'fatou.ndiaye@email.com',
      telephone: '+221 77 321 65 98',
      dateAdhesion: '2023-08-05',
      statut: 'actif',
      service: 'Marketing',
      adresse: 'Kaolack, Sénégal'
    }
  ]);

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [showAddForm, setShowAddForm] = useState(false);

  const adherentsFiltres = adherents.filter(adherent => {
    const matchRecherche = 
      adherent.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      adherent.prenom.toLowerCase().includes(recherche.toLowerCase()) ||
      adherent.email.toLowerCase().includes(recherche.toLowerCase());
    
    const matchStatut = filtreStatut === 'tous' || adherent.statut === filtreStatut;
    
    return matchRecherche && matchStatut;
  });

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'inactif': return 'bg-gray-100 text-gray-800';
      case 'suspendu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatutLabel = (statut: string) => {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'inactif': return 'Inactif';
      case 'suspendu': return 'Suspendu';
      default: return statut;
    }
  };

  const stats = {
    total: adherents.length,
    actifs: adherents.filter(a => a.statut === 'actif').length,
    inactifs: adherents.filter(a => a.statut === 'inactif').length,
    suspendus: adherents.filter(a => a.statut === 'suspendu').length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des adhérents</h1>
          <p className="text-gray-600">Gérez les membres de la mutuelle ({stats.total} adhérents)</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel adhérent
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total adhérents</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Actifs</p>
              <p className="text-3xl font-bold text-green-600">{stats.actifs}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Inactifs</p>
              <p className="text-3xl font-bold text-gray-600">{stats.inactifs}</p>
            </div>
            <div className="p-3 rounded-full bg-gray-100">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Suspendus</p>
              <p className="text-3xl font-bold text-red-600">{stats.suspendus}</p>
            </div>
            <div className="p-3 rounded-full bg-red-100">
              <Users className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher par nom, prénom ou email..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="actif">Actif</option>
              <option value="inactif">Inactif</option>
              <option value="suspendu">Suspendu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des adhérents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Adhérents ({adherentsFiltres.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adhérent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date d'adhésion
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adherentsFiltres.map((adherent) => (
                <tr key={adherent.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {adherent.prenom.charAt(0)}{adherent.nom.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {adherent.prenom} {adherent.nom}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {adherent.adresse}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center mb-1">
                      <Mail className="w-3 h-3 mr-1" />
                      {adherent.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-3 h-3 mr-1" />
                      {adherent.telephone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{adherent.service}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(adherent.statut)}`}>
                      {getStatutLabel(adherent.statut)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(adherent.dateAdhesion).toLocaleDateString('fr-FR')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {adherentsFiltres.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun adhérent trouvé</h3>
          <p className="text-gray-500">Aucun adhérent ne correspond à vos critères de recherche</p>
        </div>
      )}
    </div>
  );
}