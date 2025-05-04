//import { Theme } from './theme.model';
import { Tache } from './tache.model';
import { Groupe } from './groupe.model';
//import { Enseignant } from './enseignant.model';

export interface Projet {
  idProjet?: number;
  titreProjet: string;
  descriptionProjet: string;
  dateCreation?: Date;
  visibilite?: 'PRIVE' | 'PUBLIQUE' | 'Par_invitation';
  statut?: 'ToDo' | 'EnCours'|'Terminé'|'Test'|'Validé'|'Annulé';
  //theme?: Theme;
  taches?: Tache[];
  groupe?: Groupe;
  //enseignant?: Enseignant;

}
