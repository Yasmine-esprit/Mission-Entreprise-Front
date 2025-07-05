/* ─────────── Thème disponible ─────────── */
export interface ThemeChoix {
  idTheme?: number;
  titreTheme: string;
  description: string;
  classeId?: number;
  groupeId?: number;
  moduleId?: number;
  disponible?: boolean;
}

/* ─────────── Choix effectué par l’étudiant ─────────── */
export interface ChoixEtudiant {
  etudiantId?: number;   // ← ajouté : permet de transmettre (ou non) l’ID de l’étudiant
  classeId?:   number;
  groupeId?:   number;
  themeId?:    number;
  choixEffectue?: boolean;
}
