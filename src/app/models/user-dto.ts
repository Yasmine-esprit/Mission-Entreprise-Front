// src/app/models/user-dto.ts
export interface UserDTO {
  idUser: number;
  nomUser: string;
  prenomUser: string;
  emailUser: string;
  enabledUser: boolean;
  accountLockedUser: boolean;
  roles: string[];       // e.g. ["ADMIN","USER"]
  photoProfil?: string;  // base64 or URL
}
