import { Projet } from './projet.model';
//import { Etudiant } from './etudiant.model';
//import { NoteTGrp } from './note-tgrp.model';
//import { Repo } from './repo.model';

export interface Groupe {
  idGroupe?: number;
  nomGroupe: string;
  dateCreation?: Date;
  visibilite?: 'PRIVE' | 'PUBLIQUE' | 'Par_invitation';
  projet?: Projet;
  //etudiants?: Etudiant[];
  //noteTGrps?: NoteTGrp[];
  //repo?: Repo;
}
