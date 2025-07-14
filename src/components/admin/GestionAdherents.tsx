import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ProfileService } from '../../services/profileService';
import { FamilyService } from '../../services/familyService';
import { AuthService } from '../../services/authService';
import { AjouterAdherentForm } from './AjouterAdherentForm';
import { FamilleEditForm } from '../FamilleEditForm';
import { supabase } from '../../lib/supabase';
import { MembreFamille, MembreFamilleFormData } from '../../types';
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
import type { Profile, FamilyMember } from '../../lib/supabase';

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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [adherents, setAdherents] = useState<Profile[]>([]);
  const [membresFamille, setMembresFamille] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const [recherche, setRecherche] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<string>('tous');
  const [showAddForm, setShowAddForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [expandedAdherents, setExpandedAdherents] = useState<Set<string>>(new Set());
  const [showEditForm, setShowEditForm] = useState(false);
  const [membreToEdit, setMembreToEdit] = useState<MembreFamille | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState<{
    show: boolean;
    action: 'activer' | 'suspendre' | 'reinitialiser' | 'supprimer_membre' | null;
    adherent: Profile | null;
    membre?: FamilyMember | null;
  }>({ show: false, action: null, adherent: null, membre: null });

  // Charger les données depuis Supabase
React.useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);

      // ✅ Étape 1 : Récupérer l'utilisateur connecté
      const { data: userData, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('Erreur de récupération de l’utilisateur connecté :', userError.message);
        return;
      }

      const user = userData.user;
      console.log('✅ Utilisateur connecté :', user);
      console.log('🪪 ID utilisateur :', user?.id);
      console.log('📧 Email utilisateur :', user?.email);
      console.log('🎭 Role utilisateur (métadonnée) :', user?.user_metadata?.role);

      // ✅ Étape 2 : Charger les données liées aux profils et membres de famille
      const [profilesData, familyData] = await Promise.all([
        ProfileService.getAllProfiles(),
        FamilyService.getAllFamilyMembers()
      ]);

      console.log('👤 Adhérents récupérés depuis Supabase :', profilesData);
      console.log('👨‍👩‍👧‍👦 Membres de famille récupérés :', familyData);

      setAdherents(profilesData);
      setMembresFamille(familyData);

    } catch (error) {
      console.error('Erreur lors du chargement des données :', error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  // Initialiser les filtres selon les paramètres URL
  React.useEffect(() => {
    const statutParam = searchParams.get('statut');
    
    if (statutParam) {
      setFiltreStatut(statutParam);
    }
  }, [searchParams]);

  const adherentsFiltres = adherents.filter(adherent => {
    // Filtrer seulement les membres (pas admin/controleur)
    if (adherent.role !== 'membre') return false;
    
    const matchRecherche = 
      adherent.full_name.toLowerCase().includes(recherche.toLowerCase()) ||
      adherent.email.toLowerCase().includes(recherche.toLowerCase());
    
    // Filtrer selon le statut réel de l'utilisateur
    let matchStatut = true;
    if (filtreStatut === 'actif') {
      matchStatut = adherent.is_active !== false; // Considérer null comme actif pour compatibilité
    } else if (filtreStatut === 'inactif' || filtreStatut === 'suspendu') {
      matchStatut = adherent.is_active === false;
    } else if (filtreStatut !== 'tous') {
      matchStatut = false;
    }
    
    return matchRecherche && matchStatut;
  });

  const getMembresFamilleByAdherent = (adherentId: string) => {
    return membresFamille.filter(membre => membre.member_of_user_id === adherentId);
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

  const confirmAction = (action: 'activer' | 'suspendre' | 'reinitialiser', adherent: Profile) => {
    setShowConfirmModal({ show: true, action, adherent });
  };

  const executeAction = () => {
    if (!showConfirmModal.adherent || !showConfirmModal.action) return;

    const executeAsyncAction = async () => {
      try {
        let success = false;
        
        switch (showConfirmModal.action) {
          case 'activer':
            success = await ProfileService.activateUser(showConfirmModal.adherent!.id);
            break;
          case 'suspendre':
            success = await ProfileService.suspendUser(showConfirmModal.adherent!.id);
            break;
          case 'reinitialiser':
            success = await AuthService.resetUserPassword(
              showConfirmModal.adherent!.id,
              showConfirmModal.adherent!.email
            );
            break;
          case 'supprimer_membre':
            if (showConfirmModal.membre) {
              success = await FamilyService.deleteFamilyMember(showConfirmModal.membre.id);
            }
            break;
        }
        
        if (success) {
          setSuccessMessage(`Action ${showConfirmModal.action} exécutée avec succès.`);
          
          // Recharger les données
          const [profilesData, familyData] = await Promise.all([
            ProfileService.getAllProfiles(),
            FamilyService.getAllFamilyMembers()
          ]);
          setAdherents(profilesData);
          setMembresFamille(familyData);
        } else {
          setSuccessMessage(`Erreur lors de l'exécution de l'action ${showConfirmModal.action}.`);
        }
      } catch (error) {
        console.error('Error executing action:', error);
        setSuccessMessage(`Erreur lors de l'exécution de l'action ${showConfirmModal.action}.`);
      }
      
      setTimeout(() => setSuccessMessage(''), 5000);
    };
    
    executeAsyncAction();

    setShowConfirmModal({ show: false, action: null, adherent: null, membre: null });
  };

  const handleAjouterAdherent = async (data: AdherentFormData) => {
    try {
      const newUser = await AuthService.createUser(data.email, data.motDePasse, {
        full_name: `${data.prenom} ${data.nom}`,
        role: 'membre',
        phone: data.telephone,
        address: data.adresse,
        service: data.service
      });
      
      if (newUser) {
        setSuccessMessage(`L'adhérent ${data.prenom} ${data.nom} a été ajouté avec succès !`);
        
        // Recharger les données
        const profilesData = await ProfileService.getAllProfiles();
        setAdherents(profilesData);
        
        setShowAddForm(false);
      } else {
        setSuccessMessage(`Erreur lors de l'ajout de l'adhérent ${data.prenom} ${data.nom}.`);
      }
    } catch (error) {
      console.error('Error adding adherent:', error);
      setSuccessMessage(`Erreur lors de l'ajout de l'adhérent ${data.prenom} ${data.nom}.`);
    }
    
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Fonction de mappage FamilyMember (Supabase) vers MembreFamille (Formulaire)
  const mapFamilyMemberToMembreFamille = (member: FamilyMember): MembreFamille => {
    return {
      id: member.id,
      nom: member.last_name,
      prenom: member.first_name,
      npi: member.npi,
      acteNaissance: member.birth_certificate_ref,
      dateNaissance: member.date_of_birth,
      relation: member.relation,
      dateAjout: member.date_added,
      pieceJustificative: member.justification_document ? {
        nom: member.justification_document.nom || 'Document',
        url: member.justification_document.url || '',
        path: member.justification_document.path || '',
        taille: member.justification_document.taille || 0,
        dateUpload: member.justification_document.dateUpload || new Date().toISOString()
      } : undefined
    };
  };

  // Fonction de mappage inverse MembreFamilleFormData vers FamilyMemberFormData
  const mapMembreFamilleFormDataToFamilyMemberFormData = (data: Partial<MembreFamilleFormData>): Partial<any> => {
    const mappedData: any = {};
    
    if (data.nom !== undefined) mappedData.last_name = data.nom;
    if (data.prenom !== undefined) mappedData.first_name = data.prenom;
    if (data.npi !== undefined) mappedData.npi = data.npi;
    if (data.acteNaissance !== undefined) mappedData.birth_certificate_ref = data.acteNaissance;
    if (data.dateNaissance !== undefined) mappedData.date_of_birth = data.dateNaissance;
    if (data.relation !== undefined) mappedData.relation = data.relation;
    if (data.pieceJustificative !== undefined) mappedData.justification_document = data.pieceJustificative;
    
    return mappedData;
  };

  const handleEditMembre = (membre: FamilyMember) => {
    const mappedMembre = mapFamilyMemberToMembreFamille(membre);
    setMembreToEdit(mappedMembre);
    setShowEditForm(true);
  };

  const handleSaveMembre = async (id: string, data: Partial<MembreFamilleFormData>): Promise<boolean> => {
    try {
      const mappedData = mapMembreFamilleFormDataToFamilyMemberFormData(data);
      const success = await FamilyService.updateFamilyMember(id, mappedData);
      if (success) {
        setSuccessMessage('Membre de famille modifié avec succès par l\'administrateur.');
        setTimeout(() => setSuccessMessage(''), 5000);
        setShowEditForm(false);
        setMembreToEdit(null);
        
        // Recharger les données
        const familyData = await FamilyService.getAllFamilyMembers();
        setMembresFamille(familyData);
      }
      return success;
    } catch (error) {
      console.error('Error updating family member:', error);
      return false;
    }
  };

  const confirmDeleteMembre = (membre: FamilyMember, adherent: Profile) => {
    setShowConfirmModal({ 
      show: true, 
      action: 'supprimer_membre', 
      adherent, 
      membre 
    });
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'activer': return 'activer';
      case 'suspendre': return 'suspendre';
      case 'reinitialiser': return 'réinitialiser le mot de passe de';
      case 'supprimer_membre': return 'supprimer le membre de famille';
      default: return action;
    }
  };

  // Fonction pour vérifier si une relation peut être ajoutée/modifiée
  const canAddRelationForMember = async (relation: string, userId: string, currentMemberId?: string): Promise<boolean> => {
    try {
      // Récupérer les membres de famille actuels pour cet utilisateur
      const currentFamilyMembers = getMembresFamilleByAdherent(userId);
      
      // Filtrer le membre actuel si on est en train de le modifier
      const otherMembers = currentMemberId 
        ? currentFamilyMembers.filter(m => m.id !== currentMemberId)
        : currentFamilyMembers;
      
      switch (relation) {
        case 'epoux':
        case 'epouse':
          return !otherMembers.some(m => m.relation === 'epoux' || m.relation === 'epouse');
        case 'pere':
          return !otherMembers.some(m => m.relation === 'pere');
        case 'mere':
          return !otherMembers.some(m => m.relation === 'mere');
        case 'beau_pere':
          return !otherMembers.some(m => m.relation === 'beau_pere');
        case 'belle_mere':
          return !otherMembers.some(m => m.relation === 'belle_mere');
        case 'enfant':
          return otherMembers.filter(m => m.relation === 'enfant').length < 6;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking relation availability:', error);
      return false;
    }
  };
  // Calculer les statistiques basées sur les données réelles
  const membresOnly = adherents.filter(a => a.role === 'membre');
  const stats = {
    total: membresOnly.length,
    actifs: membresOnly.filter(a => a.is_active !== false).length, // null ou true = actif
    inactifs: membresOnly.filter(a => a.is_active === false).length,
    suspendus: membresOnly.filter(a => a.is_active === false).length, // Même chose que inactifs pour l'instant
    totalMembres: membresFamille.length
  };

  const statsCards = [
    {
      title: 'Total adhérents',
      value: stats.total,
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      filter: 'tous'
    },
    {
      title: 'Actifs',
      value: stats.actifs,
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      filter: 'actif'
    },
    {
      title: 'Inactifs',
      value: stats.inactifs,
      icon: Users,
      iconBg: 'bg-gray-100',
      iconColor: 'text-gray-600',
      filter: 'inactif'
    },
    {
      title: 'Suspendus',
      value: stats.suspendus,
      icon: Users,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      filter: 'suspendu'
    },
    {
      title: 'Membres famille',
      value: stats.totalMembres,
      icon: User,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      filter: null // Pas de filtre pour les membres de famille
    }
  ];

  const handleStatClick = (filter: string | null) => {
    if (filter) {
      setFiltreStatut(filter);
      setRecherche('');
      // Mettre à jour l'URL
      const newSearchParams = new URLSearchParams();
      if (filter !== 'tous') {
        newSearchParams.set('statut', filter);
      }
      navigate(`/admin/adherents?${newSearchParams.toString()}`, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
        {statsCards.map((stat, index) => (
          <button
            key={index}
            onClick={() => handleStatClick(stat.filter)}
            disabled={!stat.filter}
            className={`bg-white rounded-lg p-6 shadow-sm border border-gray-200 text-left group transition-all duration-200 w-full ${
              stat.filter 
                ? 'hover:shadow-md hover:border-gray-300 cursor-pointer' 
                : 'cursor-default'
            } ${
              stat.filter === filtreStatut 
                ? 'ring-2 ring-blue-500 border-blue-300 bg-blue-50' 
                : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold transition-colors ${
                  stat.filter && stat.filter === filtreStatut
                    ? 'text-blue-600'
                    : stat.filter
                    ? `${stat.iconColor.replace('text-', 'text-')} group-hover:text-blue-600`
                    : stat.iconColor
                }`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg} ${
                stat.filter ? 'group-hover:scale-110' : ''
              } transition-transform`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.filter && stat.filter === filtreStatut
                    ? 'text-blue-600'
                    : stat.filter
                    ? `${stat.iconColor} group-hover:text-blue-600`
                    : stat.iconColor
                } transition-colors`} />
              </div>
            </div>
            {stat.filter && (
              <div className="mt-2 text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                Cliquez pour filtrer
              </div>
            )}
          </button>
        ))}
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
            const isActive = adherent.is_active !== false; // null ou true = actif
            
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
                              {adherent.full_name.split(' ')[0]?.charAt(0)}{adherent.full_name.split(' ')[1]?.charAt(0) || ''}
                            </span>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="text-lg font-medium text-gray-900">
                              {adherent.full_name}
                            </h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {isActive ? 'Actif' : 'Suspendu'}
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
                                {adherent.phone || 'Non renseigné'}
                              </div>
                            </div>
                            <div>
                              <div className="mb-1">Service: {adherent.service || 'Non renseigné'}</div>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {adherent.address || 'Non renseigné'}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Adhésion: {adherent.date_adhesion ? new Date(adherent.date_adhesion).toLocaleDateString('fr-FR') : 'Non renseigné'}
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
                      
                      {/* Actions de gestion du statut */}
                      {!isActive ? (
                        <button 
                          onClick={() => confirmAction('activer', adherent)}
                          className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition-colors"
                          title="Activer"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      ) : (
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
                                    {membre.first_name} {membre.last_name}
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
                                {new Date(membre.date_of_birth).toLocaleDateString('fr-FR')} ({calculateAge(membre.date_of_birth)} ans)
                              </div>
                              <div>
                                <span className="font-medium">NPI:</span> {membre.npi}
                              </div>
                              <div>
                                <span className="font-medium">Acte:</span> {membre.birth_certificate_ref}
                              </div>
                              <div className="text-xs text-gray-500">
                                Ajouté le {new Date(membre.date_added).toLocaleDateString('fr-FR')}
                              </div>
                            </div>
                            
                            {/* Actions administrateur */}
                            <div className="flex space-x-2 mt-2">
                              <button
                                onClick={() => handleEditMembre(membre)}
                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                                title="Modifier ce membre de famille"
                              >
                                <Edit className="w-3 h-3 mr-1" />
                                Modifier
                              </button>
                              <button
                                onClick={() => confirmDeleteMembre(membre, adherent)}
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
              {showConfirmModal.action === 'supprimer_membre' ? (
                <>
                  Êtes-vous sûr de vouloir supprimer le membre de famille{' '}
                  <span className="font-medium">
                    {showConfirmModal.membre?.first_name} {showConfirmModal.membre?.last_name}
                  </span>{' '}
                  de la famille de{' '}
                  <span className="font-medium">
                    {showConfirmModal.adherent.full_name}
                  </span> ?
                </>
              ) : (
                <>
                  Êtes-vous sûr de vouloir {getActionLabel(showConfirmModal.action || '')} l'adhérent{' '}
                  <span className="font-medium">
                    {showConfirmModal.adherent.full_name}
                  </span> ?
                </>
              )}
            </p>
            
            {showConfirmModal.action === 'reinitialiser' ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  Un nouveau mot de passe temporaire sera envoyé par email à l'adhérent.
                </p>
              </div>
            ) : showConfirmModal.action === 'supprimer_membre' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  Cette action est irréversible. Le membre de famille sera définitivement supprimé.
                </p>
              </div>
            ) : showConfirmModal.action === 'activer' ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  L'adhérent pourra à nouveau accéder à la plateforme et soumettre des demandes.
                </p>
              </div>
            ) : showConfirmModal.action === 'suspendre' ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  L'adhérent ne pourra plus accéder à la plateforme jusqu'à sa réactivation.
                </p>
              </div>
            ) : null}

            <div className="flex space-x-3">
              <button
                onClick={executeAction}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white transition-colors ${
                  showConfirmModal.action === 'activer'
                    ? 'bg-green-600 hover:bg-green-700'
                    : showConfirmModal.action === 'suspendre'
                    ? 'bg-red-600 hover:bg-red-700'
                    : showConfirmModal.action === 'supprimer_membre'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                Confirmer
              </button>
              <button
                onClick={() => setShowConfirmModal({ show: false, action: null, adherent: null, membre: null })}
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

      {/* Formulaire d'édition de membre de famille */}
      {showEditForm && membreToEdit && (
        <FamilleEditForm
          membre={membreToEdit}
          onSave={handleSaveMembre}
          onCancel={() => {
            setShowEditForm(false);
            setMembreToEdit(null);
          }}
          canAddRelation={(relation, currentId) => {
            // Permettre de garder la relation actuelle
            if (currentId && membreToEdit && relation === membreToEdit.relation) {
              return true;
            }
            // Vérifier si la nouvelle relation est disponible
            return canAddRelationForMember(relation, membreToEdit.member_of_user_id, currentId);
          }}
        />
      )}
    </div>
  );
}