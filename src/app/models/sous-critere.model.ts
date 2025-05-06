import { Critere } from "./critere.model";

export interface SousCritere {
    idSousCritere?: number;
    descriptionSousCritere: string;
    noteMax: number;
    noteMin: number;
    critere?: Critere | number; // Reference to parent Critere
  }