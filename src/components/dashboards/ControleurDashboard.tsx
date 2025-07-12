import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useDemandes } from '../../contexts/DemandeContext';
import { FileText, Calendar, DollarSign, CheckCircle, XCircle, Clock, User, Filter, Search, Eye } from 'lucide-react';

export function ControleurDashboard() {
  const { user } = useAuth();
  const { getDemandesByRole, updateDemandeStatut } = useDemandes();
  
  // Fonctions utilitaires déclarées en premier pour éviter les erreurs de référence
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
      'acceptee': 'Approuvée',
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

  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);
  const [commentaire, setCommentaire] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('en_attente');
  const [recherche, setRecherche] = useState('');
  
  const toutesLesDemandes = getDemandesByRole('controleur');
  
  // Filtrage des demandes
  const demandesFiltrees = toutesLesDemandes.filter(demande => {
    const matchStatut = filtreStatut === 'tous' || demande.statut === filtreStatut;
    const matchRecherche = 
      (getTypeLabel(demande.type) || '').toLowerCase().includes(recherche.toLowerCase()) ||
      (demande.membreNom || '').toLowerCase().includes(recherche.toLowerCase()) ||
      (demande.beneficiaireNom || '').toLowerCase().includes(recherche.toLowerCase());
    
    return matchStatut && matchRecherche;
  });

  const handleApprouver = (demandeId: string) => {
    if (user) {
      updateDemandeStatut(demandeId, 'acceptee', user.id, user.name, commentaire);
      setSelectedDemande(null);
      setCommentaire('');
    }
  };

  const handleRejeter = (demandeId: string) => {
    if (user && commentaire.trim()) {
      updateDemandeStatut(demandeId, 'rejetee', user.id, user.name, commentaire);
      setSelectedDemande(null);
      setCommentaire('');
    }
  };

  const stats = {
    total: toutesLesDemandes.length,
    enAttente: toutesLesDemandes.filter(d => d.statut === 'en_attente').length,
    approuvees: toutesLesDemandes.filter(d => d.statut === 'acceptee').length,
    rejetees: toutesLesDemandes.filter(d => d.statut === 'rejetee').length,
    validees: toutesLesDemandes.filter(d => d.statut === 'validee').length
  };

  const demandeSelectionnee = selectedDemande ? toutesLesDemandes.find(d => d.id === selectedDemande) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">
                Contrôle des Demandes
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                Contrôleur
              </span>
            </div>
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  <span className="font-medium">{user.name}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total demandes</p>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Approuvées</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.approuvees}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
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

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Validées</p>
                  <p className="text-2xl font-bold text-green-600">{stats.validees}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Filtres et recherche */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="acceptee">Approuvées</option>
                  <option value="rejetee">Rejetées</option>
                  <option value="validee">Validées</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFiltreStatut('en_attente');
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
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Toutes les demandes ({demandesFiltrees.length})
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Examinez et traitez les demandes soumises par les membres
              </p>
            </div>
            <div className="divide-y divide-gray-200">
              {demandesFiltrees.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>Aucune demande trouvée</p>
                  <p className="text-sm">Aucune demande ne correspond à vos critères</p>
                </div>
              ) : (
                demandesFiltrees.map((demande) => (
                  <div key={demande.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{getTypeLabel(demande.type)} - {demande.beneficiaireNom}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(demande.statut)}`}>
                            {getStatutIcon(demande.statut)}
                            <span className="ml-1">{getStatutLabel(demande.statut)}</span>
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{getTypeLabel(demande.type)}</p>
                        <div className="flex items-center mt-2 text-sm text-gray-600">
                          <User className="w-4 h-4 mr-1" />
                          {demande.membreNom}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Bénéficiaire: {demande.beneficiaireNom} ({demande.beneficiaireRelation})</p>
                        {demande.montant && (
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <DollarSign className="w-4 h-4 mr-1" />
                            {demande.montant.toLocaleString()} FCFA
                          </div>
                        )}
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-1" />
                          Soumise le {new Date(demande.dateSoumission).toLocaleDateString('fr-FR')}
                        </div>
                        {demande.dateTraitement && (
                          <div className="flex items-center mt-1 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            Traitée le {new Date(demande.dateTraitement).toLocaleDateString('fr-FR')}
                            {demande.controleurNom && ` par ${demande.controleurNom}`}
                          </div>
                        )}
                      </div>
                      <div className="ml-6 flex-shrink-0 space-y-2">
                        <button
                          onClick={() => setSelectedDemande(demande.id)}
                          className="block w-full px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          <Eye className="w-4 h-4 inline mr-2" />
                          Examiner
                        </button>
                        {demande.statut === 'en_attente' && (
                          <div className="space-y-2">
                            <button
                              onClick={() => {
                                setSelectedDemande(demande.id);
                                setCommentaire('');
                              }}
                              className="block w-full px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 inline mr-2" />
                              Approuver
                            </button>
                            <button
                              onClick={() => {
                                setSelectedDemande(demande.id);
                                setCommentaire('');
                              }}
                              className="block w-full px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4 inline mr-2" />
                              Rejeter
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Modal de traitement */}
          {selectedDemande && demandeSelectionnee && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Examiner la demande
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
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Membre</h5>
                    <p className="text-sm text-gray-600">{demandeSelectionnee.membreNom}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Bénéficiaire</h5>
                    <p className="text-sm text-gray-600">{demandeSelectionnee.beneficiaireNom} ({demandeSelectionnee.beneficiaireRelation})</p>
                  </div>

                  {demandeSelectionnee.montant && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Montant demandé</h5>
                      <p className="text-sm text-gray-600">{demandeSelectionnee.montant.toLocaleString()} FCFA</p>
                    </div>
                  )}

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Date de soumission</h5>
                    <p className="text-sm text-gray-600">{new Date(demandeSelectionnee.dateSoumission).toLocaleDateString('fr-FR')}</p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Statut actuel</h5>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(demandeSelectionnee.statut)}`}>
                      {getStatutIcon(demandeSelectionnee.statut)}
                      <span className="ml-1">{getStatutLabel(demandeSelectionnee.statut)}</span>
                    </span>
                  </div>

                  {demandeSelectionnee.commentaire && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Commentaire précédent</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">{demandeSelectionnee.commentaire}</p>
                    </div>
                  )}
                </div>

                {demandeSelectionnee.statut === 'en_attente' && (
                  <>
                    <div className="mb-6">
                      <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-2">
                        Commentaire (requis pour le rejet)
                      </label>
                      <textarea
                        id="commentaire"
                        value={commentaire}
                        onChange={(e) => setCommentaire(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ajoutez un commentaire sur votre décision..."
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <div className="flex items-start">
                        <Clock className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-yellow-800 mb-1">Attention</h3>
                          <p className="text-sm text-yellow-700">
                            <strong>Approuver</strong> : La demande sera transmise à l'administrateur pour validation finale.<br/>
                            <strong>Rejeter</strong> : La demande sera définitivement rejetée et ne pourra plus être traitée.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleApprouver(demandeSelectionnee.id)}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approuver et transmettre
                      </button>
                      <button
                        onClick={() => handleRejeter(demandeSelectionnee.id)}
                        disabled={!commentaire.trim()}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Rejeter définitivement
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
                    </div>
                  </>
                )}

                {demandeSelectionnee.statut !== 'en_attente' && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        setSelectedDemande(null);
                        setCommentaire('');
                      }}
                      className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}