import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { FamilyService, type FamilyMemberFormData } from '../services/familyService';
import { AuditService } from '../services/auditService';
import type { FamilyMember } from '../lib/supabase';

interface FamilleContextType {
  membresFamille: FamilyMember[];
  loading: boolean;
  ajouterMembreFamille: (data: FamilyMemberFormData, membreId: string) => Promise<boolean>;
  supprimerMembreFamille: (id: string) => Promise<boolean>;
  modifierMembreFamille: (id: string, data: Partial<FamilyMemberFormData>) => Promise<boolean>;
  getMembresFamilleByMembre: (membreId: string) => Promise<FamilyMember[]>;
  canAddMember: (relation: string, membreId: string) => Promise<boolean>;
  refreshFamilyMembers: () => Promise<void>;
}

const FamilleContext = createContext<FamilleContextType | undefined>(undefined);

export function FamilleProvider({ children }: { children: ReactNode }) {
  const [membresFamille, setMembresFamille] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const refreshFamilyMembers = async () => {
    // Only load family members if user is authenticated
    if (!isAuthenticated || !user) {
      setMembresFamille([]);
      return;
    }

    try {
      setLoading(true);
      const allMembers = await FamilyService.getAllFamilyMembers();
      setMembresFamille(allMembers);
    } catch (error) {
      console.error('Error refreshing family members:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les membres de famille seulement quand l'utilisateur est authentifié
  React.useEffect(() => {
    if (isAuthenticated && user) {
      refreshFamilyMembers();
    } else {
      setMembresFamille([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const canAddMember = async (relation: string, membreId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      return await FamilyService.canAddRelation(membreId, relation);
    } catch (error) {
      console.error('Error checking if can add member:', error);
      return false;
    }
  };

  const ajouterMembreFamille = async (data: FamilyMemberFormData, membreId: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      setLoading(true);
      
      const canAdd = await canAddMember(data.relation, membreId);
      if (!canAdd) {
        return false;
      }

      const newMember = await FamilyService.addFamilyMember(membreId, data);
      
      if (newMember) {
        // Rafraîchir la liste des membres de famille
        await refreshFamilyMembers();
        
        // Log d'ajout de membre de famille
        await AuditService.createLog(
          'Ajout membre famille',
          `Membre ${data.first_name} ${data.last_name} ajouté`,
          'success',
          'Gestion famille'
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error adding family member:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const supprimerMembreFamille = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      setLoading(true);
      
      const success = await FamilyService.deleteFamilyMember(id);
      
      if (success) {
        // Rafraîchir la liste des membres de famille
        await refreshFamilyMembers();
        
        // Log de suppression de membre de famille
        await AuditService.createLog(
          'Suppression membre famille',
          `Membre de famille supprimé (ID: ${id})`,
          'warning',
          'Gestion famille'
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error deleting family member:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const modifierMembreFamille = async (id: string, data: Partial<FamilyMemberFormData>): Promise<boolean> => {
    if (!isAuthenticated || !user) {
      return false;
    }

    try {
      setLoading(true);
      
      const success = await FamilyService.updateFamilyMember(id, data);
      
      if (success) {
        // Rafraîchir la liste des membres de famille
        await refreshFamilyMembers();
        
        // Log de modification de membre de famille
        await AuditService.createLog(
          'Modification membre famille',
          `Membre de famille modifié (ID: ${id})`,
          'info',
          'Gestion famille'
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating family member:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getMembresFamilleByMembre = async (membreId: string): Promise<FamilyMember[]> => {
    if (!isAuthenticated || !user) {
      return [];
    }

    try {
      return await FamilyService.getFamilyMembers(membreId);
    } catch (error) {
      console.error('Error getting family members by member:', error);
      return [];
    }
  };


  return (
    <FamilleContext.Provider value={{
      membresFamille,
      loading,
      ajouterMembreFamille,
      supprimerMembreFamille,
      modifierMembreFamille,
      getMembresFamilleByMembre,
      canAddMember,
      refreshFamilyMembers
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