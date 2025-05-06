import { GrilleEvaluation } from "./grille-evaluation.model";
import { SousCritere } from "./sous-critere.model";

export interface Critere {
    idCritere?: number;
    descriptionCritere: string;
    noteMaxCritere: number;
    sousCriteres?: SousCritere[];
    grilleEvaluation?: GrilleEvaluation | number; // Can reference object or just ID
  }