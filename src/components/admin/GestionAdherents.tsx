import React, { useState } from 'react';
import { AjouterAdherentForm } from './AjouterAdherentForm';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  UserCheck, 
  UserX, 
  RotateCcw,
  ChevronDown,
  ChevronRight,
  User,
  Baby,
  Heart,
  UserPlus,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useFamille } from '../../contexts/FamilleContext';

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

interface AdherentFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  service: string;
  motDePasse: string;
  confirmerMotDePasse: string;
}

export function GestionAdherents() {
  const { membresFamille, supprimerMembreFamille, modifierMembreFamille } = useFamille();
  const [adherents, setAdherents] = useState<Adherent[]>([
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
      statut: 'suspendu',
      service: 'Marketing',
      adresse: 'Kaolack, Sénégal'
    }
  ]);

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [expandedAdherents, setExpandedAdherents] = useState<Set<string>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState<{
    show: boolean;
    action: 'activer' | 'suspendre' | 'reinitialiser' | null;
    adherent: Adherent | null;
  }>({ show: false, action: null, adherent: null });

  const adherentsFiltres = adherents.filter(adherent => {
    const matchRecherche = 
      adherent.nom.toLowerCase().includes(recherche.toLowerCase()) ||
      adherent.prenom.toLowerCase().includes(recherche.toLowerCase()) ||
      adherent.email.toLowerCase().includes(recherche.toLowerCase());
    
    const matchStatut = filtreStatut === 'tous' || adherent.statut === filtreStatut;
    
    return matchRecherche && matchStatut;
  });

  const getMembresFamilleByAdherent = (adherentId: string) => {
    return membresFamille.filter(membre => membre.membreId === adherentId);
  };

  const toggleExpanded = (adherentId: string) => {
    const newExpanded = new Set(expandedAdherents);
    if (newExpanded.has(adherentId)) {
      newExpanded.delete(adherentId);
    } else {
      newExpanded.add(adherentId);
    }
    setExpandedAdherents(newExpanded);
  };

  const getRelationIcon = (relation: string) => {
    switch (relation) {
      case 'epoux':
      case 'epouse':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'enfant':
        return <Baby className="w-4 h-4 text-blue-500" />;
      case 'pere':
      case 'mere':
        return <User className="w-4 h-4 text-green-500" />;
      case 'beau_pere':
      case 'belle_mere':
        return <UserPlus className="w-4 h-4 text-purple-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRelationLabel = (relation: string) => {
    const labels = {
      'epoux': 'Époux',
      'epouse': 'Épouse',
      'enfant': 'Enfant',
      'pere': 'Père',
      'mere': 'Mère',
      'beau_pere': 'Beau-père',
      'belle_mere': 'Belle-mère'
    };
    return labels[relation as keyof typeof labels] || relation;
  };

  const getRelationColor = (relation: string) => {
    const colors = {
      'epoux': 'bg-pink-100 text-pink-800',
      'epouse': 'bg-pink-100 text-pink-800',
      'enfant': 'bg-blue-100 text-blue-800',
      'pere': 'bg-green-100 text-green-800',
      'mere': 'bg-green-100 text-green-800',
      'beau_pere': 'bg-purple-100 text-purple-800',
      'belle_mere': 'bg-purple-100 text-purple-800'
    };
    return colors[relation as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const calculateAge = (dateNaissance: string) => {
    const today = new Date();
    const birthDate = new Date(dateNaissance);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

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

  const handleActiverAdherent = (adherentId: string) => {
    setAdherents(prev => prev.map(adherent => 
      adherent.id === adherentId 
        ? { ...adherent, statut: 'actif' as const }
        : adherent
    ));
  };

  const handleSuspendreAdherent = (adherentId: string) => {
    setAdherents(prev => prev.map(adherent => 
      adherent.id === adherentId 
        ? { ...adherent, statut: 'suspendu' as const }
        : adherent
    ));
  };

  const handleReinitialiserAdherent = (adherentId: string) => {
    // Simulation de la réinitialisation du mot de passe
    console.log(`Réinitialisation du mot de passe pour l'adhérent ${adherentId}`);
    
    // En réalité, ceci enverrait une requête à l'API pour réinitialiser le mot de passe
    // et marquerait l'utilisateur comme devant changer son mot de passe
    setTimeout(() => {
      alert(`Le mot de passe de l'adhérent a été réinitialisé. Un email avec les instructions a été envoyé.`);
    }, 500);
  };

  const confirmAction = (action: 'activer' | 'suspendre' | 'reinitialiser', adherent: Adherent) => {
    setShowConfirmModal({ show: true, action, adherent });
  };

  const executeAction = () => {
    if (!showConfirmModal.adherent || !showConfirmModal.action) return;

    switch (showConfirmModal.action) {
      case 'activer':
        handleActiverAdherent(showConfirmModal.adherent.id);
        break;
      case 'suspendre':
        handleSuspendreAdherent(showConfirmModal.adherent.id);
        break;
      case 'reinitialiser':
        handleReinitialiserAdherent(showConfirmModal.adherent.id);
        break;
    }

    setShowConfirmModal({ show: false, action: null, adherent: null });
  };

  const handleAjouterAdherent = (data: AdherentFormData) => {
    // Générer un nouvel adhérent
    const nouvelAdherent: Adherent = {
      id: (adherents.length + 1).toString(),
      nom: data.nom,
      prenom: data.prenom,
      email: data.email,
      telephone: data.telephone,
      adresse: data.adresse,
      service: data.service,
      dateAdhesion: new Date().toISOString().split('T')[0],
      statut: 'actif'
    };

    // Ajouter à la liste
    setAdherents(prev => [...prev, nouvelAdherent]);
    
    // Afficher un message de succès
    setSuccessMessage(`L'adhérent ${data.prenom} ${data.nom} a été ajouté avec succès !`);
    setTimeout(() => setSuccessMessage(''), 5000);
    
    // Fermer le formulaire
    setShowAddForm(false);
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'activer': return 'activer';
      case 'suspendre': return 'suspendre';
      case 'reinitialiser': return 'réinitialiser le mot de passe de';
      default: return action;
    }
  };

  const stats = {
    total: adherents.length,
    actifs: adherents.filter(a => a.statut === 'actif').length,
    inactifs: adherents.filter(a => a.statut === 'inactif').length,
    suspendus: adherents.filter(a => a.statut === 'suspendu').length,
    totalMembres: membresFamille.length
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des adhérents</h1>
          <p className="text-gray-600">
            Gérez les membres de la mutuelle ({stats.total} adhérents, {stats.totalMembres} membres de famille)
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel adhérent
        </button>
      </div>

      {/* Message de succès */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
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

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Membres famille</p>
              <p className="text-3xl font-bold text-purple-600">{stats.totalMembres}</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <User className="w-6 h-6 text-purple-600" />
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

      {/* Liste des adhérents avec structure arborescente */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Adhérents et leurs familles ({adherentsFiltres.length})
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Cliquez sur un adhérent pour voir les membres de sa famille
          </p>
        </div>
        
        <div className="divide-y divide-gray-200">
          {adherentsFiltres.map((adherent) => {
            const membresFamilleAdherent = getMembresFamilleByAdherent(adherent.id);
            const isExpanded = expandedAdherents.has(adherent.id);
            
            return (
              <div key={adherent.id}>
                {/* Adhérent principal */}
                <div className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1">
                      {/* Bouton d'expansion */}
                      <button
                        onClick={() => toggleExpanded(adherent.id)}
                        className="mr-3 p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        {membresFamilleAdherent.length > 0 ? (
                          isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                          )
                        ) : (
                          <div className="w-4 h-4" />
                        )}
                      </button>

                      {/* Informations de l'adhérent */}
                      <div className="flex items-center flex-1">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                            <span className="text-sm font-bold text-blue-600">
                              {adherent.prenom.charAt(0)}{adherent.nom.charAt(0)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {adherent.prenom} {adherent.nom}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(adherent.statut)}`}>
                              {getStatutLabel(adherent.statut)}
                            </span>
                            {membresFamilleAdherent.length > 0 && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                <Users className="w-3 h-3 mr-1" />
                                {membresFamilleAdherent.length} membre{membresFamilleAdherent.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                              <div className="flex items-center mb-1">
                                <Mail className="w-3 h-3 mr-1" />
                                {adherent.email}
                              </div>
                              <div className="flex items-center">
                                <Phone className="w-3 h-3 mr-1" />
                                {adherent.telephone}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1">Service: {adherent.service}</div>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {adherent.adresse}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Adhésion: {new Date(adherent.dateAdhesion).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-6 flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {adherent.statut !== 'actif' && (
                        <button 
                          onClick={() => confirmAction('activer', adherent)}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                          title="Activer"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      
                      {adherent.statut === 'actif' && (
                        <button 
                          onClick={() => confirmAction('suspendre', adherent)}
                          className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition-colors"
                          title="Suspendre"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => confirmAction('reinitialiser', adherent)}
                        className="text-orange-600 hover:text-orange-900 p-2 hover:bg-orange-50 rounded transition-colors"
                        title="Réinitialiser le mot de passe"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Membres de famille (affichés si développé) */}
                {isExpanded && membresFamilleAdherent.length > 0 && (
                  <div className="bg-gray-50 border-t border-gray-200">
                    <div className="px-6 py-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Users className="w-4 h-4 mr-2" />
                        Membres de famille ({membresFamilleAdherent.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {membresFamilleAdherent.map((membre) => (
                          <div key={membre.id} className="bg-white rounded-lg p-4 border border-gray-200">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                  {getRelationIcon(membre.relation)}
                                </div>
                                <div>
                                  <h5 className="text-sm font-medium text-gray-900">
                                    {membre.prenom} {membre.nom}
                                  </h5>
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRelationColor(membre.relation)}`}>
                                    {getRelationLabel(membre.relation)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-xs text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {new Date(membre.dateNaissance).toLocaleDateString('fr-FR')} ({calculateAge(membre.dateNaissance)} ans)
                              </div>
                              <div>
                                <span className="font-medium">NPI:</span> {membre.npi}
                              </div>
                              <div>
                                <span className="font-medium">Acte:</span> {membre.acteNaissance}
                              </div>
                              <div className="text-xs text-gray-500">
                                Ajouté le {new Date(membre.dateAjout).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            
                            {/* Actions administrateur */}
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => {
                                  // Pour l'instant, on simule une modification simple
                                  const nouveauNom = prompt(`Modifier le nom de ${membre.prenom} ${membre.nom}:`, membre.nom);
                                  if (nouveauNom && nouveauNom.trim() && nouveauNom !== membre.nom) {
                                    const success = modifierMembreFamille(membre.id, { nom: nouveauNom.trim() });
                                    if (success) {
                                      alert('Membre de famille modifié avec succès');
                                    } else {
                                      alert('Erreur lors de la modification');
                                    }
                                  }
                                }}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                title="Modifier ce membre de famille"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${membre.prenom} ${membre.nom} de la famille ?`)) {
                                    const success = supprimerMembreFamille(membre.id);
                                    if (success) {
                                      alert('Membre de famille supprimé avec succès');
                                    } else {
                                      alert('Erreur lors de la suppression');
                                    }
                                  }
                                }}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                                title="Supprimer ce membre de famille"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {adherentsFiltres.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun adhérent trouvé</h3>
          <p className="text-gray-500">Aucun adhérent ne correspond à vos critères de recherche</p>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirmModal.show && showConfirmModal.adherent && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer l'action
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Êtes-vous sûr de vouloir {getActionLabel(showConfirmModal.action || '')} l'adhérent{' '}
              <span className="font-medium">
                {showConfirmModal.adherent.prenom} {showConfirmModal.adherent.nom}
              </span> ?
            </p>
            
            {showConfirmModal.action === 'reinitialiser' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Un nouveau mot de passe temporaire sera envoyé par email à l'adhérent.
                </p>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
                  showConfirmModal.action === 'activer' 
                    ? 'bg-green-600 hover:bg-green-700'
                    : showConfirmModal.action === 'suspendre'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirmModal({ show: false, action: null, adherent: null })}
                className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulaire d'ajout d'adhérent */}
      {showAddForm && (
        <AjouterAdherentForm
          onClose={() => setShowAddForm(false)}
          onSubmit={handleAjouterAdherent}
        />
      )}
    </div>
  );
}