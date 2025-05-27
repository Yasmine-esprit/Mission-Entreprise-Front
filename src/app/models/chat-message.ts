export interface ChatMessage {
  idMsg?: number;
  contenu: string;
  dateEnvoi: Date;
  lu: boolean;
  groupeMsg: {
    idGrpMsg: number;
  };
  userMessage?: {
    idUser: number;
    username?: string;
  };
  senderId?: number;
  senderName?: string; // ← ajoute ceci
}
