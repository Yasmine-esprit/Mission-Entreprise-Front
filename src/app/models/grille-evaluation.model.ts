import { Critere } from "./critere.model";
import { NoteTGrp } from "./note-tgrp.model";
import { NoteTIndiv } from "./note-tindiv.model";

export enum TypeGrilleEval {
  INDIVIDUAL = 'INDIVIDUAL',
  GROUP = 'GROUP'
}

export interface GrilleEvaluation {
  idEvaluation?: number;
  nomEvaluation: string;
  dateEvaluation: string; // ISO format (YYYY-MM-DD)
  typeEval: TypeGrilleEval;
  criteres?: Critere[];
  noteIndiv?: NoteTIndiv[];
  noteGrp?: NoteTGrp[];
  //phase?: Phase | number;
}