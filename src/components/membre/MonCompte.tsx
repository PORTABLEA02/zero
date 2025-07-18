import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileService } from '../../services/profileService';
import { StorageService } from '../../services/storageService';
import type { Profile } from '../../lib/supabase';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  Eye, 
  EyeOff, 
  Save, 
  Edit,
  CheckCircle,
  AlertCircle,
  Calendar,
  Building,
  CreditCard,
  Camera,
  Trash2
} from 'lucide-react';

interface ProfileFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  service: string;
  numeroAdhesion: string;
  dateAdhesion?: string;
}

interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function MonCompte() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  // Données du profil utilisateur
  const [profileData, setProfileData] = useState<ProfileFormData>({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    service: '',
    numeroAdhesion: '',
    dateAdhesion: ''
  });

  // Charger les données du profil au montage
  React.useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        const profile = await ProfileService.getProfile(user.id);
        
        if (profile) {
          // Diviser le nom complet en nom et prénom
              const nameParts = profile.full_name.trim().split(/\s+/);
              
              let nom = '';
              let prenom = '';
              
              for (const part of nameParts) {
                if (/^[A-ZÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇÑ]+$/.test(part)) {
                  nom += (nom ? ' ' : '') + part;
                } else {
                  prenom += (prenom ? ' ' : '') + part;
                }
              }
                      
          setProfileData({
            nom,
            prenom,
            email: profile.email,
            telephone: profile.phone || '',
            adresse: profile.address || '',
            service: profile.service || '',
            numeroAdhesion: profile.adhesion_number || '',
            dateAdhesion: profile.date_adhesion || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage({
          type: 'error',
          text: 'Erreur lors du chargement du profil'
        });
        setTimeout(() => setMessage(null), 5000);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const [passwordData, setPasswordData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{
    profile?: Partial<ProfileFormData>;
    password?: Partial<PasswordFormData>;
  }>({});

  const handleProfileChange = (field: keyof ProfileFormData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur si elle existe
    if (errors.profile?.[field]) {
      setErrors(prev => ({
        ...prev,
        profile: { ...prev.profile, [field]: undefined }
      }));
    }
  };

  const handlePasswordChange = (field: keyof PasswordFormData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur si elle existe
    if (errors.password?.[field]) {
      setErrors(prev => ({
        ...prev,
        password: { ...prev.password, [field]: undefined }
      }));
    }
  };

  const validateProfile = (): boolean => {
    const newErrors: Partial<ProfileFormData> = {};
    
    if (!profileData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!profileData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!profileData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    if (!profileData.telephone.trim()) {
      newErrors.telephone = 'Le téléphone est requis';
    } else if (!/^\+?[\d\s-()]+$/.test(profileData.telephone)) {
      newErrors.telephone = 'Format de téléphone invalide';
    }
    if (!profileData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
    if (!profileData.service.trim()) newErrors.service = 'Le service est requis';

    setErrors(prev => ({ ...prev, profile: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Partial<PasswordFormData> = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Le mot de passe actuel est requis';
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
      newErrors.newPassword = 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre';
    }
    
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'La confirmation est requise';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(prev => ({ ...prev, password: newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = () => {
    const saveProfile = async () => {
      if (!user || !validateProfile()) return;

      try {
        // Construire l'objet de mise à jour
        const updates: Partial<Profile> = {
          full_name: `${profileData.prenom} ${profileData.nom}`,
          email: profileData.email,
          phone: profileData.telephone,
          address: profileData.adresse,
          service: profileData.service
        };

        const success = await ProfileService.updateProfile(user.id, updates);
        
        if (success) {
          // Rafraîchir les données utilisateur dans le contexte
          await refreshUser();
          
          setMessage({
            type: 'success',
            text: 'Profil mis à jour avec succès'
          });
          setIsEditing(false);
        } else {
          setMessage({
            type: 'error',
            text: 'Erreur lors de la mise à jour du profil'
          });
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        setMessage({
          type: 'error',
          text: 'Erreur lors de la mise à jour du profil'
        });
      }
      
      setTimeout(() => setMessage(null), 5000);
    };

    saveProfile();
  };

  const [isLoading, setIsLoading] = useState(false);

  const { updatePassword } = useAuth();

  const handleChangePassword = () => {
    const changePassword = async () => {
      if (!validatePassword()) return;

      setIsLoading(true);
      
      try {
        if (updatePassword) {
          await updatePassword(passwordData.newPassword);
        }
        
        setMessage({
          type: 'success',
          text: 'Mot de passe modifié avec succès'
        });
        
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        setTimeout(() => setMessage(null), 5000);
      } catch (error) {
        console.error('Error changing password:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur lors du changement de mot de passe';
        setMessage({
          type: 'error',
          text: errorMessage === 'New password should be different from the old password.' 
            ? 'Le nouveau mot de passe doit être différent de l\'ancien mot de passe.'
            : errorMessage
        });
        setTimeout(() => setMessage(null), 5000);
      } finally {
        setIsLoading(false);
      }
    };

    changePassword();
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;

    setUploadingAvatar(true);
    try {
      // Upload du fichier vers le bucket avatars
      const uploadResult = await StorageService.uploadAvatar(file, user.id);
      
      if (uploadResult) {
        // Mettre à jour le profil avec la nouvelle URL d'avatar
        const success = await ProfileService.updateProfile(user.id, {
          avatar_url: uploadResult.url
        });
        
        if (success) {
          // Rafraîchir les données utilisateur
          await refreshUser();
          setMessage({
            type: 'success',
            text: 'Photo de profil mise à jour avec succès'
          });
        } else {
          setMessage({
            type: 'error',
            text: 'Erreur lors de la mise à jour du profil'
          });
        }
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l\'upload de l\'avatar'
      });
    } finally {
      setUploadingAvatar(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;

    try {
      // Supprimer le fichier du stockage si l'utilisateur a un avatar
      if (user.avatarUrl) {
        // Extraire le chemin du fichier depuis l'URL
        const url = new URL(user.avatarUrl);
        const pathParts = url.pathname.split('/');
        const bucketIndex = pathParts.findIndex(part => part === 'avatars');
        if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
          const filePath = pathParts.slice(bucketIndex).join('/');
          await StorageService.deleteAvatar(filePath);
        }
      }

      const success = await ProfileService.updateProfile(user.id, {
        avatar_url: null
      });
      
      if (success) {
        await refreshUser();
        setMessage({
          type: 'success',
          text: 'Photo de profil supprimée avec succès'
        });
      } else {
        setMessage({
          type: 'error',
          text: 'Erreur lors de la suppression de la photo'
        });
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors de la suppression de la photo'
      });
    }
    
    setTimeout(() => setMessage(null), 5000);
  };
  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (loadingProfile) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Mon compte</h1>
          <p className="text-sm sm:text-base text-gray-600">Chargement...</p>
        </div>
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Mon compte</h1>
        <p className="text-sm sm:text-base text-gray-600">Gérez vos informations personnelles et votre sécurité</p>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-2" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-4 sm:px-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'profile'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-4 h-4 inline mr-2" />
              Informations personnelles
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'password'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Sécurité
            </button>
          </nav>
        </div>

        <div className="p-4 sm:p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* En-tête du profil */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatarUrl ? (
                        <img 
                          src={user.avatarUrl} 
                          alt="Photo de profil" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    {isEditing && (
                      <div className="absolute -bottom-2 -right-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleAvatarUpload(file);
                            }
                          }}
                          className="hidden"
                          id="avatar-upload"
                          disabled={uploadingAvatar}
                        />
                        <label
                          htmlFor="avatar-upload"
                          className={`flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition-colors ${
                            uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          {uploadingAvatar ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {profileData.prenom} {profileData.nom}
                    </h3>
                    <p className="text-sm text-gray-500">{profileData.service}</p>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <CreditCard className="w-3 h-3 mr-1" />
                      <span className="text-blue-700 ml-2">
                        Adhérent n° {profileData.numeroAdhesion || 'Non attribué'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-400 mt-1">
                      <Calendar className="w-3 h-3 mr-1" />
                      Membre depuis {profileData.dateAdhesion ? new Date(profileData.dateAdhesion).toLocaleDateString('fr-FR') : 'date inconnue'}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  {isEditing && user?.avatarUrl && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer photo
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    {isEditing ? 'Annuler' : 'Modifier'}
                  </button>
                </div>
              </div>

              {/* Informations d'adhésion */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Informations d'adhésion</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-800 font-medium">Numéro d'adhérent :</span>
                    <span className="text-blue-700 ml-2">{profileData.numeroAdhesion}</span>
                  </div>
                  <div>
                    <span className="text-blue-800 font-medium">Statut :</span>
                    <span className="text-blue-700 ml-2">
                      {user?.is_active !== false ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800 font-medium">Date d'adhésion :</span>
                    <span className="text-blue-700 ml-2">
                      {profileData.dateAdhesion ? new Date(profileData.dateAdhesion).toLocaleDateString('fr-FR') : 'Non renseigné'}
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-800 font-medium">Cotisations :</span>
                    <span className="text-blue-700 ml-2">
                      {user?.is_active !== false ? 'À jour' : 'En retard'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Formulaire de profil */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.nom}
                      onChange={(e) => handleProfileChange('nom', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      } ${errors.profile?.nom ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.profile?.nom && (
                    <p className="text-red-500 text-xs mt-1">{errors.profile.nom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.prenom}
                      onChange={(e) => handleProfileChange('prenom', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      } ${errors.profile?.prenom ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.profile?.prenom && (
                    <p className="text-red-500 text-xs mt-1">{errors.profile.prenom}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      } ${errors.profile?.email ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.profile?.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={profileData.telephone}
                      onChange={(e) => handleProfileChange('telephone', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      } ${errors.profile?.telephone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.profile?.telephone && (
                    <p className="text-red-500 text-xs mt-1">{errors.profile.telephone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.adresse}
                      onChange={(e) => handleProfileChange('adresse', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      } ${errors.profile?.adresse ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.profile?.adresse && (
                    <p className="text-red-500 text-xs mt-1">{errors.profile.adresse}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.service}
                      onChange={(e) => handleProfileChange('service', e.target.value)}
                      disabled={!isEditing}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'
                      } ${errors.profile?.service ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.profile?.service && (
                    <p className="text-red-500 text-xs mt-1">{errors.profile.service}</p>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Enregistrer
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'password' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Changer le mot de passe
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Assurez-vous d'utiliser un mot de passe fort pour protéger votre compte.
                </p>
              </div>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mot de passe actuel
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.password?.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password?.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.password?.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Entrez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password?.newPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.newPassword}</p>
                  )}
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Le mot de passe doit contenir :</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Au moins 8 caractères</li>
                      <li>Une lettre majuscule</li>
                      <li>Une lettre minuscule</li>
                      <li>Un chiffre</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmer le nouveau mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                        errors.password?.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password?.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleChangePassword}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Changer le mot de passe
                  </button>
                </div>
              </div>

              {/* Conseils de sécurité */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Conseils de sécurité
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Utilisez un mot de passe unique pour ce compte</li>
                  <li>• Ne partagez jamais votre mot de passe</li>
                  <li>• Changez votre mot de passe régulièrement</li>
                  <li>• Utilisez un gestionnaire de mots de passe</li>
                  <li>• Contactez l'administrateur en cas de problème</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}