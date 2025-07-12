import React, { createContext, useContext, useState, ReactNode } from 'react';
import { MembreFamille, MembreFamilleFormData } from '../types';

interface FamilleContextType {
  membresFamille: MembreFamille[];
  ajouterMembreFamille: (data: MembreFamilleFormData, membreId: string) => boolean;
  supprimerMembreFamille: (id: string) => boolean;
  modifierMembreFamille: (id: string, data: Partial<MembreFamilleFormData>) => boolean;
  getMembresFamilleByMembre: (membreId: string) => MembreFamille[];
  canAddMember: (relation: MembreFamille['relation'], membreId: string) => boolean;
}

const FamilleContext = createContext<FamilleContextType | undefined>(undefined);

export function FamilleProvider({ children }: { children: ReactNode }) {
  const [membresFamille, setMembresFamille] = useState<MembreFamille[]>([
    {
      id: '1',
      nom: 'Dupont',
      prenom: 'Marie',
      npi: '1985031512345',
      acteNaissance: 'AN-2024-001',
      npi: '1985031512345',
      acteNaissance: 'AN-2024-001',
      dateNaissance: '1985-03-15',
      relation: 'epouse',
      membreId: '1',
      dateAjout: '2024-01-01'
    },
    {
      id: '2',
      nom: 'Dupont',
      prenom: 'Pierre',
      npi: '2010062067890',
      acteNaissance: 'AN-2024-002',
      npi: '2010062067890',
      acteNaissance: 'AN-2024-002',
      dateNaissance: '2010-06-20',
      relation: 'enfant',
      membreId: '1',
      dateAjout: '2024-01-01'
    },
    {
      id: '3',
      nom: 'Dupont',
      prenom: 'Sophie',
      npi: '2012091054321',
      acteNaissance: 'AN-2024-003',
      npi: '2012091054321',
      acteNaissance: 'AN-2024-003',
      dateNaissance: '2012-09-10',
      relation: 'enfant',
      membreId: '1',
      dateAjout: '2024-01-01'
    }
  ]);

  const canAddMember = (relation: MembreFamille['relation'], membreId: string): boolean => {
    const familleActuelle = membresFamille.filter(m => m.membreId === membreId);
    
    switch (relation) {
      case 'epoux':
      case 'epouse':
        return !familleActuelle.some(m => m.relation === 'epoux' || m.relation === 'epouse');
      case 'pere':
        return !familleActuelle.some(m => m.relation === 'pere');
      case 'mere':
        return !familleActuelle.some(m => m.relation === 'mere');
      case 'beau_pere':
        return !familleActuelle.some(m => m.relation === 'beau_pere');
      case 'belle_mere':
        return !familleActuelle.some(m => m.relation === 'belle_mere');
      case 'enfant':
        return familleActuelle.filter(m => m.relation === 'enfant').length < 6;
      default:
        return false;
    }
  };

  const ajouterMembreFamille = (data: MembreFamilleFormData, membreId: string): boolean => {
    if (!canAddMember(data.relation, membreId)) {
      return false;
    }

    // Simuler l'upload du fichier de pièce justificative
    let pieceJustificativeInfo = undefined;
    if (data.pieceJustificative) {
      pieceJustificativeInfo = {
        nom: data.pieceJustificative.name,
        taille: data.pieceJustificative.size,
        type: data.pieceJustificative.type,
        dateUpload: new Date().toISOString(),
        url: `uploads/famille/${Date.now()}_${data.pieceJustificative.name}` // URL simulée
      };
    }

    const nouveauMembre: MembreFamille = {
      id: Date.now().toString(),
      nom: data.nom,
      prenom: data.prenom,
      npi: data.npi,
      acteNaissance: data.acteNaissance,
      dateNaissance: data.dateNaissance,
      relation: data.relation,
      membreId,
      dateAjout: new Date().toISOString().split('T')[0],
      pieceJustificative: pieceJustificativeInfo
    };

    setMembresFamille(prev => [...prev, nouveauMembre]);
    return true;
  };

  const supprimerMembreFamille = (id: string) => {
    try {
      setMembresFamille(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du membre de famille:', error);
      return false;
    }
  };

  const modifierMembreFamille = (id: string, data: Partial<MembreFamilleFormData>): boolean => {
    try {
      setMembresFamille(prev => prev.map(membre => {
        if (membre.id === id) {
          return {
            ...membre,
            ...data,
            // Conserver les champs système
            id: membre.id,
            membreId: membre.membreId,
            dateAjout: membre.dateAjout
          };
        }
        return membre;
      }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la modification du membre de famille:', error);
      return false;
    }
  };

  const getMembresFamilleByMembre = (membreId: string): MembreFamille[] => {
    return membresFamille.filter(m => m.membreId === membreId);
  };

  return (
    <FamilleContext.Provider value={{
      membresFamille,
      ajouterMembreFamille,
      supprimerMembreFamille,
      modifierMembreFamille,
      getMembresFamilleByMembre,
      canAddMember
    }}>
      {children}
    </FamilleContext.Provider>
  );
}

export function useFamille() {
  const context = useContext(FamilleContext);
  if (context === undefined) {
    throw new Error('useFamille must be used within a FamilleProvider');
  }
  return context;
}