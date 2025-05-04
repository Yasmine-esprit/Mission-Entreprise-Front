import { Projet } from './projet.model';
//import { Phase } from './phase.model';
//import { Etudiant } from './etudiant.model';
import { sousTache } from './sousTache.model';


export interface Tache {
  idTache?: number;
  titreTache: string;
  descriptionTache: string;
  dateDebut?: Date;
  dateFin?: Date;
  statut?: 'ToDo' | 'EnCours'|'Terminé'|'Test'|'Validé'|'Annulé';
  projet?: Projet;
  //phase?: Phase;
  //etudiant?: Etudiant;
  sousTaches?: sousTache[];
}
