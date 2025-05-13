import { Projet } from './projet.model';
import { sousTache } from './sousTache.model';

export interface Tache {
  idTache?: number;
  titreTache: string;
  descriptionTache: string;
  dateDebut?: Date;
  dateFin?: Date;
  statut?: 'ToDo' | 'EnCours' | 'Terminé' | 'Test' | 'Validé' | 'Annulé';
  projet?: Projet;
  sousTaches?: sousTache[];
  assigneA?: string;
}

