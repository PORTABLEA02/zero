import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DemandService, type DemandFormData } from '../services/demandService';
import { AuditService } from '../services/auditService';
import type { Demand } from '../lib/supabase';

interface DemandeContextType {
  demandes: Demand[];
  loading: boolean;
  createDemande: (data: DemandFormData, membreId: string, membreNom: string) => Promise<boolean>;
  updateDemandeStatut: (id: string, statut: 'acceptee' | 'rejetee' | 'validee', userId: string, userNom: string, commentaire?: string) => Promise<boolean>;
  getDemandesByRole: (role: string, userId?: string) => Promise<Demand[]>;
  refreshDemandes: () => Promise<void>;
}

const DemandeContext = createContext<DemandeContextType | undefined>(undefined);

export function DemandeProvider({ children }: { children: ReactNode }) {
  const [demandes, setDemandes] = useState<Demand[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshDemandes = async () => {
    try {
      setLoading(true);
      const allDemandes = await DemandService.getDemands();
      setDemandes(allDemandes);
    } catch (error) {
      console.error('Error refreshing demandes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les demandes au montage du composant
  React.useEffect(() => {
    refreshDemandes();
  }, []);

  const createDemande = async (data: DemandFormData, membreId: string, membreNom: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const nouvelleDemande = await DemandService.createDemande(membreId, membreNom, data);
      
      if (nouvelleDemande) {
        // Rafraîchir la liste des demandes
        await refreshDemandes();
        
        // Log de création de demande
        await AuditService.createLog(
          'Nouvelle demande',
          `Demande ${data.service_type} créée par ${membreNom}`,
          'info',
          'Demandes'
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating demande:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateDemandeStatut = async (
    id: string, 
    statut: 'acceptee' | 'rejetee' | 'validee', 
    userId: string, 
    userNom: string, 
    commentaire?: string
  ): Promise<boolean> => {
    try {
      setLoading(true);
      
      const success = await DemandService.updateDemandStatus(id, statut, userId, userNom, commentaire);
      
      if (success) {
        // Rafraîchir la liste des demandes
        await refreshDemandes();
        
        // Log de mise à jour de statut
        await AuditService.createLog(
          'Mise à jour statut demande',
          `Demande ${id} ${statut} par ${userNom}`,
          statut === 'rejetee' ? 'warning' : 'success',
          'Demandes'
        );
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error updating demande status:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDemandesByRole = async (role: string, userId?: string): Promise<Demand[]> => {
    try {
      return await DemandService.getDemandsByRole(role, userId);
    } catch (error) {
      console.error('Error getting demandes by role:', error);
      return [];
    }
  };

  return (
    <DemandeContext.Provider value={{ 
      demandes, 
      loading,
      createDemande, 
      updateDemandeStatut, 
      getDemandesByRole,
      refreshDemandes
    }}>
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