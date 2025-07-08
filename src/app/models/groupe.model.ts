import { Projet } from './projet.model';
//import { Etudiant } from './etudiant.model';
import {UserDTO} from "./user-dto";
//import { Repo } from './repo.model';

export enum Visibilite {
  PUBLIC = 'PUBLIC',
  PRIVE = 'PRIVE',
  BY_INVITATION = 'BY_INVITATION'
}

export interface Groupe {
  idGroupe?: number;
  nomGroupe: string;
  dateCreation?: string;
  visibilite?: Visibilite;
  projet?: Projet;
 etudiants?: UserDTO[];
  //repo?: Repo;
}
