import { Critere } from './critere.model';
import { SousCritere } from './sous-critere.model';

export interface MainCriteria {
  idMainCritere?: number;
  descMainCritere: string;
  MaxPoints: number;
  critere?: Critere;
  sousCriteres?: SousCritere[];
}