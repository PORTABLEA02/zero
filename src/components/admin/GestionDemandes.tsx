import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Download,
  AlertCircle
} from 'lucide-react';

export function GestionDemandes() {
  const { demandes, updateDemandeStatut } = useDemandes();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedDemande, setSelectedDemande] = useState<string | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<string>('acceptee');
  const [filtreType, setFiltreType] = useState<string>('tous');
  const [recherche, setRecherche] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [actionType, setActionType] = useState<'validate' | 'reject' | null>(null);

  // Fonctions utilitaires
  const getTypeLabel = (type: string = '') => {
    const labels = {
      'mariage': 'Allocation Mariage',
      'naissance': 'Allocation Naissance',
      'deces': 'Allocation Décès',
      'pret_social': 'Prêt Social',
      'pret_economique': 'Prêt Économique'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatutLabel = (statut: string = '') => {
    const labels = {
      'en_attente': 'En attente',
      'acceptee': 'Acceptée',
      'rejetee': 'Rejetée',
      'validee': 'Validée'
    };
    return labels[statut as keyof typeof labels] || statut;
  };

  const getStatutColor = (statut: string = '') => {
    const colors = {
      'en_attente': 'bg-yellow-100 text-yellow-800',
      'acceptee': 'bg-blue-100 text-blue-800',
      'rejetee': 'bg-red-100 text-red-800',
      'validee': 'bg-green-100 text-green-800'
    };
    return colors[statut as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatutIcon = (statut: string = '') => {
    switch (statut) {
      case 'en_attente': return <Clock className="w-4 h-4" />;
      case 'acceptee': return <CheckCircle className="w-4 h-4" />;
      case 'rejetee': return <XCircle className="w-4 h-4" />;
      case 'validee': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Initialiser les filtres selon les paramètres URL
  React.useEffect(() => {
    const statutParam = searchParams.get('statut');
    const typeParam = searchParams.get('type');
    
    if (statutParam) {
      // Si le paramètre est 'tous' ou vide, utiliser 'acceptee' par défaut pour l'admin
      setFiltreStatut(statutParam === 'tous' ? 'acceptee' : statutParam);
    }
    
    if (typeParam) {
      setFiltreType(typeParam);
    }
  }, [searchParams]);

  // Filtrage sécurisé des demandes
  const demandesFiltrees = demandes.filter(demande => {
    const matchStatut = filtreStatut === 'tous' || demande.statut === filtreStatut;
    const matchType = filtreType === 'tous' || demande.type === filtreType;
    
    // Protection contre les valeurs undefined/null
    const typeLabel = getTypeLabel(demande.type)?.toLowerCase() || '';
    const memberName = demande.member_name?.toLowerCase() || '';
    const beneficiaryName = demande.beneficiary_name?.toLowerCase() || '';
    const searchTerm = recherche.toLowerCase();
    
    const matchRecherche = 
      typeLabel.includes(searchTerm) ||
      memberName.includes(searchTerm) ||
      beneficiaryName.includes(searchTerm);
    
    return matchStatut && matchType && matchRecherche;
  });

  const handleValider = (demandeId: string) => {
    if (user) {
      updateDemandeStatut(demandeId, 'validee', user.id, user.name, commentaire);
      setSelectedDemande(null);
      setActionType(null);
      setCommentaire('');
    }
  };

  const handleRejeter = (demandeId: string) => {
    if (user && commentaire.trim()) {
      updateDemandeStatut(demandeId, 'rejetee', user.id, user.name, commentaire);
      setSelectedDemande(null);
      setActionType(null);
      setCommentaire('');
    }
  };

  // Statistiques
  const stats = {
    total: demandes.length,
    enAttente: demandes.filter(d => d.statut === 'en_attente').length,
    acceptees: demandes.filter(d => d.statut === 'acceptee').length, // En attente de validation admin
    validees: demandes.filter(d => d.statut === 'validee').length,
    rejetees: demandes.filter(d => d.statut === 'rejetee').length
  };

  const demandeSelectionnee = selectedDemande ? demandes.find(d => d.id === selectedDemande) : null;

  // Fonction pour formater les dates de manière sécurisée
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch {
      return 'Date invalide';
    }
  };

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
        {/* ... (le reste du code reste inchangé) ... */}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="filtreStatut" className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filtreStatut}
              onChange={(e) => setFiltreStatut(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tous">Tous les statuts</option>
              <option value="acceptee">Acceptée (en attente)</option>
              <option value="validee">Validée</option>
              <option value="rejetee">Rejetée</option>
            </select>
          </div>

          <div>
            {/* ... (le reste du code reste inchangé) ... */}
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
                      <h3 className="text-lg font-medium text-gray-900">
                        {getTypeLabel(demande.type)} - {demande.beneficiary_name || 'Bénéficiaire inconnu'}
                      </h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(demande.statut)}`}>
                        {getStatutIcon(demande.statut)}
                        <span className="ml-1">{getStatutLabel(demande.statut)}</span>
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">{getTypeLabel(demande.type)}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {demande.member_name || 'Membre inconnu'}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(demande.submission_date)}
                      </div>
                      {demande.amount && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {demande.amount.toLocaleString()} FCFA
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      Bénéficiaire: {demande.beneficiary_name || 'Inconnu'} ({demande.beneficiary_relation || 'Relation inconnue'})
                    </p>
                  </div>
                  
                  <div className="ml-4 flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedDemande(demande.id);
                        setActionType(null);
                        setCommentaire('');
                      }}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Détails
                    </button>
                    
                    {demande.statut === 'acceptee' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedDemande(demande.id);
                            setActionType('validate');
                            setCommentaire('');
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Valider
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDemande(demande.id);
                            setActionType('reject');
                            setCommentaire('');
                          }}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeter
                        </button>
                      </div>
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
                {actionType === 'validate' ? 'Valider la demande' :
                 actionType === 'reject' ? 'Rejeter la demande' :
                 'Détails de la demande'}
              </h3>
              <button
                onClick={() => {
                  setSelectedDemande(null);
                  setActionType(null);
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
                  {getTypeLabel(demandeSelectionnee.type)} - {demandeSelectionnee.beneficiary_name || 'Bénéficiaire inconnu'}
                </h4>
                <p className="text-sm text-gray-600">{getTypeLabel(demandeSelectionnee.type)}</p>
              </div>

              <div>
                <h5 className="text-sm font-medium text-gray-700 mb-1">Bénéficiaire</h5>
                <p className="text-sm text-gray-600">
                  {demandeSelectionnee.beneficiary_name || 'Inconnu'} ({demandeSelectionnee.beneficiary_relation || 'Relation inconnue'})
                </p>
              </div>

              {demandeSelectionnee.amount && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Montant</h5>
                  <p className="text-sm text-gray-600">{demandeSelectionnee.amount.toLocaleString()} FCFA</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Membre</h5>
                  <p className="text-sm text-gray-600">{demandeSelectionnee.member_name || 'Membre inconnu'}</p>
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Date de soumission</h5>
                  <p className="text-sm text-gray-600">{formatDate(demandeSelectionnee.submission_date)}</p>
                </div>
              </div>

              {demandeSelectionnee.pieceJointe && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Pièce justificative</h5>
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{demandeSelectionnee.pieceJointe.nom || 'Document sans nom'}</p>
                        <p className="text-xs text-gray-500">
                          {(demandeSelectionnee.pieceJointe.taille / 1024 / 1024).toFixed(2)} MB • 
                          Uploadé le {formatDate(demandeSelectionnee.pieceJointe.dateUpload)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (demandeSelectionnee.pieceJointe?.url) {
                            window.open(demandeSelectionnee.pieceJointe.url, '_blank');
                          }
                        }}
                        className="inline-flex items-center px-3 py-1 border border-blue-300 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Voir
                      </button>
                      <button
                        onClick={() => {
                          if (demandeSelectionnee.pieceJointe?.url) {
                            const link = document.createElement('a');
                            link.href = demandeSelectionnee.pieceJointe.url;
                            link.download = demandeSelectionnee.pieceJointe.nom || 'document';
                            link.click();
                          }
                        }}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {demandeSelectionnee.controleurNom && (
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-1">Traité par</h5>
                  <p className="text-sm text-gray-600">{demandeSelectionnee.controleurNom}</p>
                </div>
              )}
            </div>

            {demandeSelectionnee.statut === 'acceptee' && actionType && (
              <>
                <div className="mb-6">
                  <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 mb-2">
                    Commentaire {actionType === 'reject' ? '(requis pour le rejet)' : '(optionnel)'}
                  </label>
                  <textarea
                    id="commentaire"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={actionType === 'reject' ? 'Motif du rejet (obligatoire)...' : 'Ajoutez un commentaire...'}
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800 mb-1">Attention</h3>
                      <p className="text-sm text-yellow-700">
                        {actionType === 'validate' ? (
                          <>
                            <strong>Valider</strong> : La demande sera définitivement approuvée et le processus de paiement pourra être initié.
                          </>
                        ) : (
                          <>
                            <strong>Rejeter</strong> : La demande sera définitivement rejetée et ne pourra plus être traitée. Un commentaire est obligatoire.
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {actionType === 'validate' && (
                    <button
                      onClick={() => handleValider(demandeSelectionnee.id)}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Valider définitivement
                    </button>
                  )}
                  
                  {actionType === 'reject' && (
                    <button
                      onClick={() => handleRejeter(demandeSelectionnee.id)}
                      disabled={!commentaire.trim()}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeter définitivement
                    </button>
                  )}
                  
                  <button
                    onClick={() => {
                      setSelectedDemande(null);
                      setActionType(null);
                      setCommentaire('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}

            {(demandeSelectionnee.statut !== 'acceptee' || !actionType) && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedDemande(null);
                    setActionType(null);
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
  );
}