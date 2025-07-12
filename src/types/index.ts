export interface User {
  id: string;
  name: string;
  email: string;
  role: 'membre' | 'controleur' | 'administrateur';
}

export interface Demande {
  id: string;
  type: 'mariage' | 'naissance' | 'deces' | 'pret_social' | 'pret_economique';
  beneficiaireId: string;
  beneficiaireNom: string;
  beneficiaireRelation: string;
  montant?: number;
  dateSoumission: string;
  statut: 'en_attente' | 'acceptee' | 'rejetee' | 'validee';
  membreId: string;
  membreNom: string;
  controleurId?: string;
  controleurNom?: string;
  administrateurId?: string;
  administrateurNom?: string;
  commentaire?: string;
  dateTraitement?: string;
  dateValidation?: string;
  pieceJointe?: string;
}

export interface DemandeFormData {
  type: Demande['type'];
  beneficiaireId: string;
  beneficiaireNom: string;
  beneficiaireRelation: string;
  montant?: number;
  pieceJointe?: string;
  dateSurvenance?: string;
  paiement: PaiementInfo;
}

export interface MembreFamille {
  id: string;
  nom: string;
  prenom: string;
  npi: string;
  acteNaissance: string;
  npi: string;
  acteNaissance: string;
  dateNaissance: string;
  relation: 'epoux' | 'epouse' | 'enfant' | 'pere' | 'mere' | 'beau_pere' | 'belle_mere';
  membreId: string;
  dateAjout: string;
}

export interface MembreFamilleFormData {
  nom: string;
  prenom: string;
  npi: string;
  acteNaissance: string;
  dateNaissance: string;
  relation: MembreFamille['relation'];
  pieceJustificative?: File;
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
export interface PaiementInfo {
  modePaiement: 'mobile_money' | 'virement_bancaire' | 'cheque';
  // Pour mobile money
  numeroAbonnement?: string;
  nomAbonne?: string;
  // Pour virement bancaire
  compteBancaire?: string;
  nomCompte?: string;
}