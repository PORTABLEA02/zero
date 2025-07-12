import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useFamille } from '../contexts/FamilleContext';
import { FamilleForm } from './FamilleForm';
import { MembreFamilleFormData } from '../types';
import { Plus, User, Calendar, Trash2, Users } from 'lucide-react';

interface FamilleManagementProps {
  onBack?: () => void;
}

export function FamilleManagement({ onBack }: FamilleManagementProps) {
  const { user } = useAuth();
  const { getMembresFamilleByMembre, ajouterMembreFamille, supprimerMembreFamille, canAddMember } = useFamille();
  const [showForm, setShowForm] = useState(false);
  
  const membresFamille = user ? getMembresFamilleByMembre(user.id) : [];

  const handleAjouterMembre = (data: MembreFamilleFormData): boolean => {
    if (user) {
      const success = ajouterMembreFamille(data, user.id);
      if (success) {
        setShowForm(false);
      }
      return success;
    }
    return false;
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mb-4"
            >
              ← Retour au dashboard
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Gestion de la famille</h1>
          <p className="text-gray-600">Gérez les membres de votre famille ({membresFamille.length} membre(s))</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un membre
        </button>
      </div>

      {/* Limites et règles */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Règles de gestion familiale</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Maximum 6 enfants</li>
          <li>• Un(e) seul(e) époux/épouse</li>
          <li>• Un père et une mère maximum</li>
          <li>• Un beau-père et une belle-mère maximum</li>
        </ul>
      </div>

      {/* Liste des membres */}
      {membresFamille.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun membre de famille</h3>
          <p className="text-gray-500 mb-4">Commencez par ajouter les membres de votre famille</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter le premier membre
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {membresFamille.map((membre) => (
            <div key={membre.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{membre.prenom} {membre.nom}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRelationColor(membre.relation)}`}>
                      {getRelationLabel(membre.relation)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => supprimerMembreFamille(membre.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(membre.dateNaissance).toLocaleDateString('fr-FR')} ({calculateAge(membre.dateNaissance)} ans)
                </div>
                <div className="text-xs text-gray-500">
                  NPI: {membre.npi}
                </div>
                <div className="text-xs text-gray-500">
                  Acte: {membre.acteNaissance}
                </div>
                <div className="text-xs text-gray-500">
                  Ajouté le {new Date(membre.dateAjout).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal d'ajout */}
      {showForm && (
        <FamilleForm
          onSubmit={handleAjouterMembre}
          onCancel={() => setShowForm(false)}
          canAddRelation={(relation) => user ? canAddMember(relation, user.id) : false}
        />
      )}
    </div>
  );
}