import { Critere } from './critere.model';


export interface GrilleEvaluation {
  idEvaluation?: number;
  teacher: string;
  nomEvaluation: string;
  dateEvaluation: Date; 
  typeEval: string;
  criteres?: Critere[];
}