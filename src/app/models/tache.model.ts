import { Projet } from './projet.model';
import { sousTache } from './sousTache.model';

export interface Tache {
  labels?: string[];
  members: any[];
  checklist?: any[];
  idTache?: number;
  titreTache: string;
  descriptionTache: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  statut?: 'ToDo' | 'EnCours' | 'Terminé' | 'Test' | 'Validé' | 'Annulé';
  projet?: Projet;
  sousTaches?: sousTache[];
  assigneA?: string;
  priorite?: string;
}

