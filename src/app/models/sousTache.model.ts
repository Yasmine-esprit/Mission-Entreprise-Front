export enum Statut {
  ToDo = 'ToDo',
  INPROGRESS = 'INPROGRESS',
  DONE = 'DONE',
  Test = 'Test',
  VALIDATED = 'VALIDATED',
  CANCELED = 'CANCELED'
}


export interface sousTache {
  idSousTache?: number;
  titreSousTache: string;
  descriptionSousTache: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: Statut;
  tache: {
    idTache: number;
  };
}
