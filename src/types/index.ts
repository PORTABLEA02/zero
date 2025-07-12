// Types legacy pour compatibilité - à supprimer progressivement
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'membre' | 'controleur' | 'administrateur';
  mustChangePassword?: boolean;
  isFirstLogin?: boolean;
  lastPasswordChange?: string;
}

export interface PaiementInfo {
  modePaiement: 'mobile_money' | 'virement_bancaire' | 'cheque';
  // Pour mobile money
  numeroAbonnement?: string;
  nomAbonne?: string;
  // Pour virement bancaire
  compteBancaire?: string;
  nomCompte?: string;
}