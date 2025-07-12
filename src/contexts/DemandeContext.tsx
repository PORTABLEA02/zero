import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Demande, DemandeFormData } from '../types';

interface DemandeContextType {
  demandes: Demande[];
  createDemande: (data: DemandeFormData, membreId: string, membreNom: string) => void;
  updateDemandeStatut: (id: string, statut: Demande['statut'], userId: string, userNom: string, commentaire?: string) => void;
  getDemandesByRole: (role: string, userId?: string) => Demande[];
}

const DemandeContext = createContext<DemandeContextType | undefined>(undefined);

export function DemandeProvider({ children }: { children: ReactNode }) {
  const [demandes, setDemandes] = useState<Demande[]>([
    {
      id: '1',
      type: 'mariage',
      beneficiaireId: '1',
      beneficiaireNom: 'Jean Dupont',
      beneficiaireRelation: 'Adhérent',
      montant: 50000,
      dateSoumission: '2024-01-15',
      statut: 'acceptee',
      membreId: '1',
      membreNom: 'Jean Dupont',
      controleurId: '2',
      controleurNom: 'Marie Martin',
      dateTraitement: '2024-01-18'
    },
    {
      id: '2',
      type: 'pret_social',
      beneficiaireId: '1',
      beneficiaireNom: 'Jean Dupont',
      beneficiaireRelation: 'Adhérent',
      montant: 100000,
      dateSoumission: '2024-01-20',
      statut: 'en_attente',
      membreId: '1',
      membreNom: 'Jean Dupont'
    }
  ]);

  const createDemande = (data: DemandeFormData, membreId: string, membreNom: string) => {
    const nouvelleDemande: Demande = {
      id: Date.now().toString(),
      ...data,
      dateSoumission: new Date().toISOString().split('T')[0],
      statut: 'en_attente',
      membreId,
      membreNom
    };
    setDemandes(prev => [...prev, nouvelleDemande]);
  };

  const updateDemandeStatut = (id: string, statut: Demande['statut'], userId: string, userNom: string, commentaire?: string) => {
    setDemandes(prev => prev.map(demande => {
      if (demande.id === id) {
        const now = new Date().toISOString().split('T')[0];
        if (statut === 'acceptee') {
          return {
            ...demande,
            statut,
            controleurId: userId,
            controleurNom: userNom,
            dateTraitement: now,
            commentaire
          };
        } else if (statut === 'rejetee') {
          return {
            ...demande,
            statut,
            controleurId: userId,
            controleurNom: userNom,
            dateTraitement: now,
            commentaire
          };
        } else if (statut === 'validee') {
          return {
            ...demande,
            statut,
            administrateurId: userId,
            administrateurNom: userNom,
            dateValidation: now,
            commentaire
          };
        }
      }
      return demande;
    }));
  };

  const getDemandesByRole = (role: string, userId?: string): Demande[] => {
    switch (role) {
      case 'membre':
        return demandes.filter(d => d.membreId === userId);
      case 'controleur':
        return demandes; // Le contrôleur voit toutes les demandes
      case 'administrateur':
        return demandes.filter(d => d.statut === 'acceptee'); // L'admin ne voit que les demandes acceptées par le contrôleur
      default:
        return [];
    }
  };

  return (
    <DemandeContext.Provider value={{ demandes, createDemande, updateDemandeStatut, getDemandesByRole }}>
      {children}
    </DemandeContext.Provider>
  );
}

export function useDemandes() {
  const context = useContext(DemandeContext);
  if (context === undefined) {
    throw new Error('useDemandes must be used within a DemandeProvider');
  }
  return context;
}