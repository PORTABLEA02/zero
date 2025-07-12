import React, { useState } from 'react';
import { useDemandes } from '../../contexts/DemandeContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Search,
  Filter,
  Eye,
  Download
} from 'lucide-react';

export function GestionDemandes() {
  const { demandes, updateDemandeStatut } = useDemandes();
  const { user } = useAuth();
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [filtreType, setFiltreType] = useState<string>('tous');
  const [recherche, setRecherche] = useState('');
  const [commentaire, setCommentaire] = useState('');

  // Déplacer les fonctions utilitaires au début du composant
  const getTypeLabel = (type: string) => {
    const labels = {
      'mariage': 'Allocation Mariage',
      'naissance': 'Allocation Naissance',
      'deces': 'Allocation Décès',
      'pret_social': 'Prêt Social',
      'pret_economique': 'Prêt Économique'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatutLabel = (statut: string) => {
    const labels = {
      'en_attente': 'En attente',
      'acceptee': 'Acceptée',
      'rejetee': 'Rejetée',
      'validee': 'Validée'
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const getStatutColor = (statut: string) => {
    const colors = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'acceptee': 'bg-blue-100 text-blue-800',
      'rejetee': 'bg-red-100 text-red-800',
      'validee': 'bg-green-100 text-green-800'
    };
    return colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'en_attente': return <Clock className="w-4 h-4" />;
      case 'acceptee': return <CheckCircle className="w-4 h-4" />;
      case 'rejetee': return <XCircle className="w-4 h-4" />;
      case 'validee': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Filtrage des demandes
  const demandesFiltrees = demandes.filter(demande => {
    const matchStatut = filtreStatut === 'tous' || demande.statut === filtreStatut;
    const matchType = filtreType === 'tous' || demande.type === filtreType;
    const matchRecherche = 
      getTypeLabel(demande.type).toLowerCase().includes(recherche.toLowerCase()) ||
      demande.membreNom.toLowerCase().includes(recherche.toLowerCase()) ||
      demande.beneficiaireNom.toLowerCase().includes(recherche.toLowerCase());
    
    return matchStatut && matchType && matchRecherche;
  });

  const handleValider = (demandeId: string) => {
    if (user) {
      updateDemandeStatut(demandeId, 'validee', user.id, user.name, commentaire);
      setSelectedDemande(null);
      setCommentaire('');
    }
  };

  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'en_attente').length,
    acceptees: demandes.filter(d => d.statut === 'acceptee').length,
    validees: demandes.filter(d => d.statut === 'validee').length,
    rejetees: demandes.filter(d => d.statut === 'rejetee').length
  };

  const demandeSelectionnee = selectedDemande ? demandes.find(d => d.id === selectedDemande) : null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des demandes</h1>
          <p className="text-gray-600">Vue d'ensemble de toutes les demandes ({stats.total} demandes)</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Exporter
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.enAttente}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Acceptées</p>
              <p className="text-2xl font-bold text-blue-600">{stats.acceptees}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Validées</p>
              <p className="text-2xl font-bold text-green-600">{stats.validees}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Rejetées</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejetees}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher..."
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
              <option value="en_attente">En attente</option>
              <option value="acceptee">Acceptée</option>
              <option value="rejetee">Rejetée</option>
              <option value="validee">Validée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filtreType}
              onChange={(e) => setFiltreType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous les types</option>
              <option value="mariage">Allocation Mariage</option>
              <option value="naissance">Allocation Naissance</option>
              <option value="deces">Allocation Décès</option>
              <option value="pret_social">Prêt Social</option>
              <option value="pret_economique">Prêt Économique</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFiltreStatut('tous');
                setFiltreType('tous');
                setRecherche('');
              }}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Liste des demandes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Demandes ({demandesFiltrees.length})
          </h3>
        </div>
        
        {demandesFiltrees.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
            <p className="text-gray-500">Aucune demande ne correspond à vos critères de recherche</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {demandesFiltrees.map((demande) => (
              <div key={demande.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{getTypeLabel(demande.type)} - {demande.beneficiaireNom}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(demande.statut)}`}>
                        {getStatutIcon(demande.statut)}
                        <span className="ml-1">{getStatutLabel(demande.statut)}</span>
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{getTypeLabel(demande.type)}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {demande.membreNom}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(demande.dateSoumission).toLocaleDateString('fr-FR')}
                      </div>
                      {demande.montant && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {demande.montant.toLocaleString()} FCFA
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Bénéficiaire: {demande.beneficiaireNom} ({demande.beneficiaireRelation})</p>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => setSelectedDemande(demande.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Détails
                    </button>
                    
                    {demande.statut === 'acceptee' && (
                      <button
                        onClick={() => setSelectedDemande(demande.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Valider
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de détails/validation */}
      {demandeSelectionnee && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                {demandeSelectionnee.statut === 'acceptee' ? 'Valider la demande' : 'Détails de la demande'}
              </h3>
              <button
                onClick={() => {
                  setSelectedDemande(null);
                  setCommentaire('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h4 className="font-medium text-gray-900">
                  {getTypeLabel(demandeSelectionnee.type)} - {demandeSelectionnee.beneficiaireNom}
                </h4>
                <p className="text-sm text-gray-600">{getTypeLabel(demandeSelectionnee.type)}</p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Bénéficiaire</h5>
                <p className="text-sm text-gray-600">{demandeSelectionnee.beneficiaireNom} ({demandeSelectionnee.beneficiaireRelation})</p>
              </div>

              {demandeSelectionnee.montant && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Montant</h5>
                  <p className="text-sm text-gray-600">{demandeSelectionnee.montant.toLocaleString()} FCFA</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Membre</h5>
                  <p className="text-sm text-gray-600">{demandeSelectionnee.membreNom}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Date de soumission</h5>
                  <p className="text-sm text-gray-600">{new Date(demandeSelectionnee.dateSoumission).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>

              {demandeSelectionnee.controleurNom && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Traité par</h5>
                  <p className="text-sm text-gray-600">{demandeSelectionnee.controleurNom}</p>
                </div>
              )}
            </div>

            {demandeSelectionnee.statut === 'acceptee' && (
              <div className="mb-6">
                <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaire de validation (optionnel)
                </label>
                <textarea
                  id="commentaire"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ajoutez un commentaire..."
                />
              </div>
            )}

            <div className="flex space-x-3">
              {demandeSelectionnee.statut === 'acceptee' ? (
                <>
                  <button
                    onClick={() => handleValider(demandeSelectionnee.id)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Valider définitivement
                  </button>
                  <button
                    onClick={() => {
                      setSelectedDemande(null);
                      setCommentaire('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setSelectedDemande(null);
                    setCommentaire('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}