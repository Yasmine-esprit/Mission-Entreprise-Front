import { Projet } from './projet.model';
import { sousTache } from './sousTache.model';

export type StatutTache = "ToDo"|"INPROGRESS" | "DONE" | "Test" | "VALIDATED" | "CANCELED";
export type PrioriteTache = "HIGHEST" | "HIGH" | "MEDIUM" | "LOW" | "LOWEST" | null;

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
  isLocal?: boolean;
  piecesJointes?: PieceJointe[];
  coverColor?: string;
  checklist?: {
    description: string;
    completed: boolean;
  }[];
  projet?: Projet | null;
  sousTaches?: sousTache[];

  lastUpdated?: Date;
  lastSynced?: Date;
  pendingChanges?: boolean;
}

export interface PieceJointe {
  idPieceJointe?: number;
  nom?: string;
  url: string;
  type: 'FICHIER' | 'LIEN';
  dateAjout: Date;
  tache?: Tache;
}

