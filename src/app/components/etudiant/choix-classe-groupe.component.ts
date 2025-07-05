import { Component, OnInit } from '@angular/core';
import { Institution, Departement, Classe, Groupe } from '../../models/institution.model';
import { ThemeChoix, ChoixEtudiant } from '../../models/theme-choix.model';
import { InstitutionService } from '../../service/institution.service';
import { ThemeChoixService } from '../../service/theme-choix.service';

@Component({
  selector: 'app-choix-classe-groupe',
  templateUrl: './choix-classe-groupe.component.html',
  styleUrls: ['./choix-classe-groupe.component.css']
})
export class ChoixClasseGroupeComponent implements OnInit {

  /* ─────────── Données ─────────── */
  institutions: Institution[] = [];
  departements:  Departement[] = [];
  classes:       Classe[]      = [];
  groupes:       Groupe[]      = [];
  themes:        ThemeChoix[]  = [];

  /* ─────────── Sélections ─────────── */
  selectedInstitution: Institution | null = null;
  selectedDepartement: Departement | null = null;
  selectedClasse:      Classe      | null = null;
  selectedGroupe:      Groupe      | null = null;
  selectedTheme:       ThemeChoix  | null = null;

  /* ─────────── État ─────────── */
  etapeActuelle = 1;        // 1 → Institution … 5 → Thème
  choixEffectue = false;
  etudiantId    = 1;        // à remplacer par l’ID réel (AuthService)
  choixEnregistre?: ChoixEtudiant;

  constructor(
    private institutionService: InstitutionService,
    private themeChoixService:   ThemeChoixService
  ) {}

  /* ── Cycle de vie ── */
 ngOnInit(): void {
  this.loadInstitutions();       // OK
  this.loadAllThemes();          // 👈 charge tous les thèmes tout de suite
  this.etapeActuelle = 5;        // 👈 rend directement l’étape Thème visible
  this.verifierChoixExistant();  // OK
}


  /* ───────────────── Chargements hiérarchiques ───────────────── */
  loadInstitutions(): void {
    this.institutionService.getAllInstitutions().subscribe({
      next: data  => this.institutions = data,
      error: err  => console.error('Erreur chargement institutions :', err)
    });
  }

  loadDepartements(id: number): void {
    this.institutionService.getDepartementsByInstitution(id).subscribe({
      next: data  => this.departements = data,
      error: err  => console.error('Erreur chargement départements :', err)
    });
  }

  /** Charge les thèmes du groupe OU tous les thèmes si la requête échoue */
  loadThemes(groupeId: number): void {
    this.themeChoixService.getThemesByGroupe(groupeId).subscribe({
      next: data  => this.themes = data,
      error: err  => {
        console.error('Erreur chargement thèmes (groupe) :', err);
        this.loadAllThemes();   // fallback : tous les thèmes
      }
    });
  }

  /** Charge l’ensemble des thèmes disponibles */
  loadAllThemes(): void {
    this.themeChoixService.getAllThemes().subscribe({
      next: data  => this.themes = data,
      error: err  => console.error('Erreur chargement tous thèmes :', err)
    });
  }

  /* ───────────────── Vérification choix existant ───────────────── */
  verifierChoixExistant(): void {
    this.themeChoixService.getChoixActuel(this.etudiantId).subscribe({
      next: (c) => {
        this.choixEnregistre = c;
        this.choixEffectue   = true;
        this.reconstruireSelection(c);
      },
      error: (err) => {
        if (err.status !== 404) console.error('Erreur vérification choix :', err);
      }
    });
  }

  private reconstruireSelection(c: ChoixEtudiant): void {
    this.selectedClasse = { idCLasse: c.classeId }  as unknown as Classe;
    this.selectedGroupe = { idGroupe: c.groupeId }  as unknown as Groupe;
    this.selectedTheme  = { idTheme:  c.themeId,  titreTheme: 'Votre thème' } as ThemeChoix;
    this.etapeActuelle  = 5;
    this.loadAllThemes();   // pour afficher la grille même si verrouillée
  }

  /* ───────────────── Sélections successives ───────────────── */
  selectInstitution(i: Institution): void {
    if (this.choixEffectue) return;
    this.selectedInstitution = i;
    this.resetSelections(2);
    this.loadDepartements(i.idInstitution!);
    this.etapeActuelle = 2;
  }

  selectDepartement(d: Departement): void {
    if (this.choixEffectue) return;
    this.selectedDepartement = d;
    this.resetSelections(3);
    this.classes = d.classes || [];
    this.etapeActuelle = 3;
  }

  selectClasse(c: Classe): void {
    if (this.choixEffectue) return;
    this.selectedClasse = c;
    this.resetSelections(4);
    this.groupes = c.groupes || [];
    this.etapeActuelle = 4;
  }

  selectGroupe(g: Groupe): void {
    if (this.choixEffectue) return;
    this.selectedGroupe = g;
    this.resetSelections(5);
    this.loadThemes(g.idGroupe!);
    this.etapeActuelle = 5;
  }

  selectTheme(t: ThemeChoix): void {
    if (this.choixEffectue) return;
    this.selectedTheme = t;
  }

  /* ───────────────── Confirmation finale ───────────────── */
  confirmerChoix(): void {
    if (this.choixEffectue || !this.selectedTheme) return;

    const choix: ChoixEtudiant = {
      etudiantId: this.etudiantId,
      classeId:   this.selectedClasse?.idCLasse,
      groupeId:   this.selectedGroupe?.idGroupe,
      themeId:    this.selectedTheme.idTheme,
      choixEffectue: true
    };

    this.themeChoixService.effectuerChoixEtudiant(choix).subscribe({
      next: ()  => this.choixEffectue = true,
      error: e  => alert('Erreur : ' + e.message)
    });
  }

  /* ───────────────── Utilitaires ───────────────── */
  retourEtape(e: number): void {
    if (this.choixEffectue) return;
    this.etapeActuelle = e;
    this.resetSelections(e + 1);
  }

  private resetSelections(from: number): void {
    if (from <= 2) { this.selectedDepartement = null; this.departements = []; }
    if (from <= 3) { this.selectedClasse      = null; this.classes      = []; }
    if (from <= 4) { this.selectedGroupe      = null; this.groupes      = []; }
    if (from <= 5) { this.selectedTheme       = null; this.themes       = []; }
  }
}
