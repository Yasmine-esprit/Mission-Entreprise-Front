import { GrilleEvaluation } from "./grille-evaluation.model";

export interface NoteTIndiv {
    noteIndivId?: number;
    noteTIndiv: number;
    grilleEvaluation?: GrilleEvaluation | number;
    //enseignant?: Enseignant | number;
    //etudiant?: Etudiant | number;
  }