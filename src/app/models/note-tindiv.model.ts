import { Critere } from './critere.model';
import { GrilleEvaluation } from './grille-evaluation.model';

export interface IndivEval {
  indivEvalId?: number;
  critere?: Critere;
  noteIndiv: number;
  grilleEvaluation?: GrilleEvaluation;
  generalComments?: string;
}