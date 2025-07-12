import React, { useState } from 'react';
import { MembreFamilleFormData, MembreFamille } from '../types';
import { X, User, Calendar, Users } from 'lucide-react';

interface FamilleFormProps {
  onSubmit: (data: MembreFamilleFormData) => boolean;
  onCancel: () => void;
  canAddRelation: (relation: MembreFamille['relation']) => boolean;
}

export function FamilleForm({ onSubmit, onCancel, canAddRelation }: FamilleFormProps) {
  const [formData, setFormData] = useState<MembreFamilleFormData>({
    nom: '',
    prenom: '',
    npi: '',
    acteNaissance: '',
    dateNaissance: '',
    relation: 'enfant'
  });

  const [errors, setErrors] = useState<Partial<MembreFamilleFormData>>({});

  const relationOptions = [
    { value: 'epoux', label: 'Époux' },
    { value: 'epouse', label: 'Épouse' },
    { value: 'enfant', label: 'Enfant' },
    { value: 'pere', label: 'Père' },
    { value: 'mere', label: 'Mère' },
    { value: 'beau_pere', label: 'Beau-père' },
    { value: 'belle_mere', label: 'Belle-mère' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Partial<MembreFamilleFormData> = {};
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.npi.trim()) newErrors.npi = 'Le numéro NPI est requis';
    if (!formData.acteNaissance.trim()) newErrors.acteNaissance = 'L\'acte de naissance est requis';
    if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const success = onSubmit(formData);
    if (success) {
      setFormData({ nom: '', prenom: '', npi: '', acteNaissance: '', dateNaissance: '', relation: 'enfant' });
      setErrors({});
    } else {
      setErrors({ relation: 'Impossible d\'ajouter ce type de membre (limite atteinte ou déjà existant)' });
    }
  };

  const handleChange = (field: keyof MembreFamilleFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Ajouter un membre de famille</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label htmlFor="relation" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Relation
            </label>
            <select
              id="relation"
              value={formData.relation}
              onChange={(e) => handleChange('relation', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {relationOptions.map(option => (
                <option 
                  key={option.value} 
                  value={option.value}
                  disabled={!canAddRelation(option.value as MembreFamille['relation'])}
                >
                  {option.label} {!canAddRelation(option.value as MembreFamille['relation']) ? '(Non disponible)' : ''}
                </option>
              ))}
            </select>
            {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation}</p>}
          </div>

          <div>
            <label htmlFor="nom" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Nom
            </label>
            <input
              type="text"
              id="nom"
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.nom ? 'border-red-500' : 'border-gray-300'
              } text-sm`}
              placeholder="Nom de famille"
            />
            {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
          </div>

          <div>
            <label htmlFor="prenom" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Prénom
            </label>
            <input
              type="text"
              id="prenom"
              value={formData.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.prenom ? 'border-red-500' : 'border-gray-300'
              } text-sm`}
              placeholder="Prénom"
            />
            {errors.prenom && <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>}
          </div>

          <div>
            <label htmlFor="npi" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Numéro NPI
            </label>
            <input
              type="text"
              id="npi"
              value={formData.npi}
              onChange={(e) => handleChange('npi', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.npi ? 'border-red-500' : 'border-gray-300'
              } text-sm`}
              placeholder="Numéro d'identification personnel"
            />
            {errors.npi && <p className="text-red-500 text-xs mt-1">{errors.npi}</p>}
          </div>

          <div>
            <label htmlFor="dateNaissance" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Date de naissance
            </label>
            <input
              type="date"
              id="dateNaissance"
              value={formData.dateNaissance}
              onChange={(e) => handleChange('dateNaissance', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.dateNaissance ? 'border-red-500' : 'border-gray-300'
              } text-sm`}
            />
            {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
          </div>

          <div>
            <label htmlFor="acteNaissance" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Acte de naissance
            </label>
            <input
              type="text"
              id="acteNaissance"
              value={formData.acteNaissance}
              onChange={(e) => handleChange('acteNaissance', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.acteNaissance ? 'border-red-500' : 'border-gray-300'
              } text-sm`}
              placeholder="Référence de l'acte de naissance"
            />
            {errors.acteNaissance && <p className="text-red-500 text-xs mt-1">{errors.acteNaissance}</p>}
          </div>

          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Ajouter
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