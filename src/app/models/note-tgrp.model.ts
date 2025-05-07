import { GrilleEvaluation } from "./grille-evaluation.model";
import { Groupe } from "./groupe.model";

export interface NoteTGrp {
    noteGrpId?: number;
    noteTGrp: number;
    grilleEvaluation?: GrilleEvaluation | number;
    groupe?: Groupe | number;
    //enseignant?: Enseignant | number;
    //etudiant?: Etudiant | number;
  }