export enum Statut {
  ToDo = 'ToDo',
  EnCours = 'EnCours',
  Terminé = 'Terminé',
  Test = 'Test',
  Validé = 'Validé',
  Annulé = 'Annulé'
}

export interface sousTache {
  idSousTache?: number;
  titreSousTache: string;
  descriptionSousTache: string;
  dateDebut?: string;
  dateFin?: string;
  statut?: Statut;
  tacheId?: number;
}
