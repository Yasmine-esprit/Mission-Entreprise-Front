export interface Institution {
  idInstitution?: number;
  nomInstitution: string;
  adresse?: string;
  description?: string;
  departements?: Departement[];
}

export interface Departement {
  idDepartement?: number;
  nomDepartement: string;
  description?: string;
  institutionId?: number;
  institution?: Institution;
  classes?: Classe[];
}

export interface Classe {
  idCLasse?: number;
  nomClasse: string;
  departementId?: number;
  departement?: Departement;
  niveauId?: number;
  groupes?: Groupe[];
  etudiants?: any[];
}

export interface Groupe {
  idGroupe?: number;
  nomGroupe: string;
  dateCreation?: Date;
  visibilite?: string;
  classeId?: number;
  classe?: Classe;
  etudiants?: any[];
}

export interface HierarchieDTO {
  institutions: Institution[];
}
