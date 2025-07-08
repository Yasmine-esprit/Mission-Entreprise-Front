import { Critere } from './critere.model';
import { GrilleEvaluation } from './grille-evaluation.model';

export interface GroupEval {
  noteGrpId?: number;
  critere?: Critere;
  noteGrp: number;
  grilleEvaluation?: GrilleEvaluation;
  comments?: string;
  generalComments?: string;
}