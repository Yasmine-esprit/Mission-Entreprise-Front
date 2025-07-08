import { MainCriteria } from './mainCriteria.model';

export enum GradingLevels {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED'
}

export enum PoinRangesSubCrit {
  LOW = 0,
  MEDIUM = 1,
  HIGH = 2
}

export interface SousCritere {
  idSousCritere?: number;
  nameSousCritere: string;
  maxPoints: number;
  gradingLevels: GradingLevels;
  poinRangesSubCrit: PoinRangesSubCrit;
  descriptionSousCritere: string;
  noteMax: number;
  mainCritere?: MainCriteria;
}