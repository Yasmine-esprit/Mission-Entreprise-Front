import { MainCriteria } from './mainCriteria.model';
import { IndivEval } from './note-tindiv.model';
import { GroupEval } from './note-tgrp.model';
import { GrilleEvaluation } from './grille-evaluation.model';

export interface Critere {
  idCritere?: number;
  titreCritere: string;
  codeCritere: string;
  descriptionCritere: string;
  TotalPoints: number;
  mainCriteria?: MainCriteria[];
  indivEvals?: IndivEval[];
  groupEvals?: GroupEval[];
  grilleEvaluation?: GrilleEvaluation;
}