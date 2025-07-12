import React, { useState } from 'react';
import { DemandeFormData } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useFamille } from '../contexts/FamilleContext';
import { X, CreditCard, Building, Smartphone, User } from 'lucide-react';

interface DemandeFormProps {
  onSubmit: (data: DemandeFormData) => void;
  onCancel: () => void;
}

export function DemandeForm({ onSubmit, onCancel }: DemandeFormProps) {
  const { user } = useAuth();
  const { getMembresFamilleByMembre } = useFamille();
  
  const membresFamille = user ? getMembresFamilleByMembre(user.id) : [];
  
  const [formData, setFormData] = useState<DemandeFormData>({
    type: 'mariage',
    beneficiaireId: user?.id || '',
    beneficiaireNom: user?.name || '',
    beneficiaireRelation: 'Adhérent',
    montant: undefined,
    pieceJointe: '',
    paiement: {
      modePaiement: 'mobile_money',
      numeroAbonnement: '77 123 45 67',
      nomAbonne: 'Jean Dupont'
    }
  });

  const [errors, setErrors] = useState<Partial<DemandeFormData>>({});

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

  const typeOptions = [
    { value: 'mariage', label: 'Allocation Mariage' },
    { value: 'naissance', label: 'Allocation Naissance' },
    { value: 'deces', label: 'Allocation Décès' },
    { value: 'pret_social', label: 'Prêt Social' },
    { value: 'pret_economique', label: 'Prêt Économique' }
  ];

  // Liste des bénéficiaires possibles (adhérent + famille)
  const beneficiaires = [
    {
      id: user?.id || '',
      nom: user?.name || '',
      relation: 'Adhérent'
    },
    ...membresFamille.map(membre => ({
      id: membre.id,
      nom: `${membre.prenom} ${membre.nom}`,
      relation: getRelationLabel(membre.relation)
    }))
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<DemandeFormData> = {};
    if (!formData.beneficiaireId) newErrors.beneficiaireId = 'Le bénéficiaire est requis';
    
    // Validation des informations de paiement
    if (formData.paiement.modePaiement === 'mobile_money') {
      if (!formData.paiement.numeroAbonnement?.trim()) {
        newErrors.beneficiaireId = 'Le numéro d\'abonnement est requis pour Mobile Money';
      }
      if (!formData.paiement.nomAbonne?.trim()) {
        newErrors.beneficiaireNom = 'Le nom de l\'abonné est requis pour Mobile Money';
      }
    } else if (formData.paiement.modePaiement === 'virement_bancaire') {
      if (!formData.paiement.compteBancaire?.trim()) {
        newErrors.beneficiaireId = 'Le compte bancaire est requis pour le virement';
      }
      if (!formData.paiement.nomCompte?.trim()) {
        newErrors.beneficiaireNom = 'Le nom du compte est requis pour le virement';
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (field: keyof DemandeFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBeneficiaireChange = (beneficiaireId: string) => {
    const beneficiaire = beneficiaires.find(b => b.id === beneficiaireId);
    if (beneficiaire) {
      setFormData(prev => ({
        ...prev,
        beneficiaireId: beneficiaire.id,
        beneficiaireNom: beneficiaire.nom,
        beneficiaireRelation: beneficiaire.relation
      }));
    }
  };

  const handlePaiementChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      paiement: { ...prev.paiement, [field]: value }
    }));
  };

  const handleModePaiementChange = (mode: 'mobile_money' | 'virement_bancaire' | 'cheque') => {
    let defaultPaiement = { modePaiement: mode };
    
    if (mode === 'mobile_money') {
      defaultPaiement = {
        ...defaultPaiement,
        numeroAbonnement: '77 123 45 67',
        nomAbonne: 'Jean Dupont'
      };
    } else if (mode === 'virement_bancaire') {
      defaultPaiement = {
        ...defaultPaiement,
        compteBancaire: 'SN08 SN01 0152 0000001234567890',
        nomCompte: 'Jean Dupont'
      };
    }
    
    setFormData(prev => ({ ...prev, paiement: defaultPaiement }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Nouvelle Demande</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="type" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Type de demande
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {typeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="beneficiaire" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Bénéficiaire de la demande
            </label>
            <select
              id="beneficiaire"
              value={formData.beneficiaireId}
              onChange={(e) => handleBeneficiaireChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.beneficiaireId ? 'border-red-500' : 'border-gray-300'
              } text-sm`}
            >
              <option value="">Sélectionner un bénéficiaire</option>
              {beneficiaires.map(beneficiaire => (
                <option key={beneficiaire.id} value={beneficiaire.id}>
                  {beneficiaire.nom} ({beneficiaire.relation})
                </option>
              ))}
            </select>
            {errors.beneficiaireId && <p className="text-red-500 text-xs mt-1">{errors.beneficiaireId}</p>}
          </div>

          {/* Affichage du bénéficiaire sélectionné */}
          {formData.beneficiaireNom && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-blue-900">Bénéficiaire sélectionné</p>
                  <p className="text-xs sm:text-sm text-blue-800 truncate">
                    {formData.beneficiaireNom} - {formData.beneficiaireRelation}
                  </p>
                </div>
              </div>
            </div>
          )}

          {(formData.type.includes('pret') || formData.type === 'mariage') && (
            <div>
              <label htmlFor="montant" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Montant (FCFA)
              </label>
              <input
                type="number"
                id="montant"
                value={formData.montant || ''}
                onChange={(e) => handleChange('montant', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                placeholder="0"
                min="0"
              />
            </div>
          )}

          {/* Section Mode de paiement */}
          <div className="border-t pt-4 sm:pt-6">
            <h4 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">Informations de paiement</h4>
            
            <div className="mb-3 sm:mb-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Mode de paiement
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => handleModePaiementChange('mobile_money')}
                  className={`flex items-center justify-center p-2 sm:p-3 border rounded-lg transition-colors text-xs sm:text-sm ${
                    formData.paiement.modePaiement === 'mobile_money'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Mobile Money
                </button>
                
                <button
                  type="button"
                  onClick={() => handleModePaiementChange('virement_bancaire')}
                  className={`flex items-center justify-center p-2 sm:p-3 border rounded-lg transition-colors text-xs sm:text-sm ${
                    formData.paiement.modePaiement === 'virement_bancaire'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Building className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Virement bancaire
                </button>
                
                <button
                  type="button"
                  onClick={() => handleModePaiementChange('cheque')}
                  className={`flex items-center justify-center p-2 sm:p-3 border rounded-lg transition-colors text-xs sm:text-sm ${
                    formData.paiement.modePaiement === 'cheque'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                  Chèque
                </button>
              </div>
            </div>

            {/* Champs spécifiques selon le mode de paiement */}
            {formData.paiement.modePaiement === 'mobile_money' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="numeroAbonnement" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Numéro d'abonnement
                  </label>
                  <input
                    type="text"
                    id="numeroAbonnement"
                    value={formData.paiement.numeroAbonnement || ''}
                    onChange={(e) => handlePaiementChange('numeroAbonnement', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="77 123 45 67"
                  />
                </div>
                <div>
                  <label htmlFor="nomAbonne" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Nom de l'abonné
                  </label>
                  <input
                    type="text"
                    id="nomAbonne"
                    value={formData.paiement.nomAbonne || ''}
                    onChange={(e) => handlePaiementChange('nomAbonne', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}

            {formData.paiement.modePaiement === 'virement_bancaire' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="compteBancaire" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Compte bancaire
                  </label>
                  <input
                    type="text"
                    id="compteBancaire"
                    value={formData.paiement.compteBancaire || ''}
                    onChange={(e) => handlePaiementChange('compteBancaire', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="SN08 SN01 0152 0000001234567890"
                  />
                </div>
                <div>
                  <label htmlFor="nomCompte" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                    Nom du compte
                  </label>
                  <input
                    type="text"
                    id="nomCompte"
                    value={formData.paiement.nomCompte || ''}
                    onChange={(e) => handlePaiementChange('nomCompte', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Jean Dupont"
                  />
                </div>
              </div>
            )}

            {formData.paiement.modePaiement === 'cheque' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  Pour le paiement par chèque, vous recevrez les instructions détaillées après validation de votre demande.
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="pieceJointe" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Pièce jointe (optionnel)
            </label>
            <input
              type="text"
              id="pieceJointe"
              value={formData.pieceJointe || ''}
              onChange={(e) => handleChange('pieceJointe', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Nom du fichier ou description"
            />
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Soumettre
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors text-sm font-medium"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}