import { Projet } from './projet.model';
import { sousTache } from './sousTache.model';

export type StatutTache = 'ToDo' | 'EnCours' | 'Terminé' | 'Test' | 'Validé' | 'Annulé';
export type PrioriteTache = "Highest" | "High" | "Medium" | "Low" | "Lowest" | null;

export interface Tache {
  idTache?: number;
  titreTache: string;
  descriptionTache: string;
  dateDebut: Date | null;
  dateFin: Date | null;
  statut?: StatutTache;
  priorite: PrioriteTache;
  assigneA?: string | null;
  labels?: string[];
  members: string[];
  piecesJointes?: PieceJointe[];
  checklist?: {
    description: string;
    completed: boolean;
  }[];
  projet?: Projet | null;
  sousTaches?: sousTache[];
}

export interface PieceJointe {
  id?: number;
  nom: string;
  url: string;
  type: 'fichier' | 'lien';
  dateAjout?: Date;
  taille?: number;
}

