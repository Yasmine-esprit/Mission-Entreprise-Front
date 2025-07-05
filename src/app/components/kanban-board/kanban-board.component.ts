import { Component, ChangeDetectorRef, OnInit, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from "@angular/router";
import { Tache } from "../../models/tache.model";
import { Projet } from '../../models/projet.model';
import { sousTache } from '../../models/sousTache.model';
import { TacheService } from "../../service/tache.service";
import { ClasseService, Classe } from "../../service/classe.service";
import { ThemeChoixService } from '../../service/theme-choix.service';
import { ThemeChoix }        from '../../models/theme-choix.model';
import { catchError, Observable, retry } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

type StatutTache = "ToDo" | "EnCours" | "Terminé" | "Test" | "Validé" | "Annulé";

interface Task {
  idTache: number;
  titreTache: string;
  descriptionTache: string;
  assigneA?: string;
  statut: StatutTache;
  dateDebut?: Date;
  dateFin?: Date;
  checklist: any[];
  members: any[];
  labels: string[];
  projet?: Projet;
  sousTaches: sousTache[];
}

interface Column {
  titre: StatutTache;
  taches: Task[];
}

interface Group {
  id: number;
  name: string;
  description: string;
  members: string[];
  isActive: boolean;
  createdDate: Date;
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent implements OnInit {
  selectedTache!: Tache;
  showTaskDetails = false;
  isAddingTask = false;
  editingDescription = false;
  tempDescription = '';
  isAddingList = false;
  newListTitle = '';
  selectedCoverColor: string = '';
  isSidebarCollapsed = false;
  currentProjectName = "Current Project";
  activeSection = 'Phases';
  activeBoard = 1;
  isLoading = false;
  previousBoardId: number | null = null;
  boardSettings: any = {};
  boardChanged = new EventEmitter<number>();
  connectedColumns: string[] = [];

  // Classes functionality
  classes: Classe[] = [];
  showClassesSection = false;
  selectedClasse: Classe | null = null;
  isEditingClasse = false;
  isAddingClasse = false;
  newClasse: Classe = { idCLasse: 0, nomClasse: '' };

  /* ---------- THEMES ---------- */
themes: ThemeChoix[] = [];
showThemesSection     = false;
isAddingTheme         = false;
isEditingTheme        = false;
selectedTheme: ThemeChoix | null = null;
newTheme: ThemeChoix  = { titreTheme: '', description: '', disponible: true };


  // Groups functionality
  showGroupsSection = false;
  showGroupPopup = false;
  groups: Group[] = [
    {
      id: 1,
      name: 'Frontend Team',
      description: 'Developers working on UI/UX',
      members: ['Lina', 'Alex', 'Sarah'],
      isActive: true,
      createdDate: new Date('2024-01-15')
    },
    {
      id: 2,
      name: 'Backend Team',
      description: 'Server-side development team',
      members: ['Yas', 'John', 'Mike'],
      isActive: true,
      createdDate: new Date('2024-01-10')
    },
    {
      id: 3,
      name: 'QA Team',
      description: 'Quality assurance specialists',
      members: ['Feten', 'Lisa'],
      isActive: false,
      createdDate: new Date('2024-01-20')
    }
  ];

  boards = [
    { id: 1, name: 'Project Tasks', color: '#5ba4cf' },
    { id: 2, name: 'Development', color: '#eb5a46' },
    { id: 3, name: 'QA Testing', color: '#f2d600' }
  ];

  newTache: Task = this.resetTache();

  colonnes: Column[] = [
    {
      titre: "ToDo",
      taches: [
        {
          idTache: 1,
          titreTache: 'Configurer le backend',
          assigneA: 'Yas',
          descriptionTache: 'Mettre en place Spring Boot',
          statut: 'ToDo',
          members: ['Yas'],
          labels: ['green'],
          checklist: [],
          sousTaches: []
        },
        {
          idTache: 2,
          titreTache: 'Créer le modèle',
          assigneA: 'Feten',
          descriptionTache: 'Modèle UML',
          statut: 'ToDo',
          members: ['Feten'],
          labels: ['blue'],
          checklist: [],
          sousTaches: []
        },
      ]
    },
    {
      titre: "EnCours",
      taches: [
        {
          idTache: 3,
          titreTache: 'Design UI',
          assigneA: 'Lina',
          descriptionTache: 'Créer maquette Figma',
          statut: 'EnCours',
          members: ['Lina'],
          labels: ['red'],
          checklist: [],
          sousTaches: []
        }
      ]
    },
    {
      titre: "Terminé",
      taches: [
        {
          idTache: 4,
          titreTache: 'Initialisation du projet',
          assigneA: 'Dali',
          descriptionTache: 'Repo GitHub, Angular init',
          statut: 'Terminé',
          members: ['Dali'],
          labels: ['green', 'blue'],
          checklist: [],
          sousTaches: []
        }
      ]
    }
  ];

  constructor(
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private tacheService: TacheService,
    private classeService: ClasseService,
    private themeService: ThemeChoixService
  ) {}

  ngOnInit(): void {}

  startAddingList() {
    this.isAddingList = true;
    this.newListTitle = '';
  }

  cancelAddingList() {
    this.isAddingList = false;
    this.newListTitle = '';
  }

  addNewList() {
    if (this.newListTitle.trim()) {
      this.colonnes.push({
        titre: this.newListTitle.trim() as StatutTache,
        taches: []
      });
      this.isAddingList = false;
      this.newListTitle = '';
      this.cdRef.detectChanges();
    }
  }

  ouvrirTache(tacheId: number) {
    this.router.navigate(['/tache', tacheId]);
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const transferredTask = event.previousContainer.data[event.previousIndex];
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      transferredTask.statut = event.container.id as StatutTache;
      this.saveTask(transferredTask);
    }
    this.cdRef.detectChanges();
  }

  saveTask(task: Task) {
    console.log('Tâche sauvegardée:', task);
  }

  openTacheDetails(tache: Task, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedTache = {...tache} as Tache;
    this.showTaskDetails = true;
    this.cdRef.detectChanges();
  }

  closeTacheDetails(): void {
    this.selectedTache = this.createEmptyTache();
    this.showTaskDetails = false;
    this.editingDescription = false;
    this.cdRef.detectChanges();
  }

  private createEmptyTache(): Tache {
    return {
      idTache: 0,
      titreTache: '',
      descriptionTache: '',
      assigneA: '',
      priorite: null,
      dateDebut: null,
      dateFin: null,
      statut: 'ToDo',
      members: [],
      labels: [],
      checklist: [],
      sousTaches: []
    };
  }

  editDescription(): void {
    this.editingDescription = true;
    this.tempDescription = this.selectedTache?.descriptionTache || '';
  }

  cancelEditDescription(): void {
    this.editingDescription = false;
    if (this.selectedTache) {
      this.selectedTache.descriptionTache = this.tempDescription;
    }
  }

  saveDescription(): void {
    this.editingDescription = false;
    if (this.selectedTache) {
      console.log('Description mise à jour:', this.selectedTache.descriptionTache);
    }
  }

  editTache(tache: Task): void {
    console.log('Édition de la tâche:', tache);
  }

  deleteTache(id: number): void {
    for (const col of this.colonnes) {
      const index = col.taches.findIndex(t => t.idTache === id);
      if (index > -1) {
        col.taches.splice(index, 1);
        break;
      }
    }
    this.closeTacheDetails();
  }

  initNewTask(statut: StatutTache): void {
    this.newTache = {
      idTache: Date.now(),
      titreTache: '',
      descriptionTache: '',
      assigneA: '',
      statut: statut,
      checklist: [],
      sousTaches: [],
      labels: ['white'],
      members: []
    };
    this.isAddingTask = true;
  }

  saveTacheForm(): void {
    const colonne = this.colonnes.find(col => col.titre === this.newTache.statut);
    if (colonne) {
      colonne.taches.push({...this.newTache});
    }
    this.resetForm();
  }

  resetForm(): void {
    this.newTache = this.resetTache();
    this.isAddingTask = false;
  }

  resetTache(): Task {
    return {
      idTache: Date.now(),
      titreTache: '',
      descriptionTache: '',
      assigneA: '',
      statut: 'ToDo',
      checklist: [],
      labels: ['white'],
      members: [],
      sousTaches: []
    };
  }

  updateTacheDescription(newDescription: string): void {
    if (this.selectedTache) {
      this.selectedTache.descriptionTache = newDescription;
      console.log('Description mise à jour:', newDescription);
      this.cdRef.detectChanges();
    }
  }

  setCoverColor(color: string): void {
    this.selectedCoverColor = color;

    if (this.selectedTache) {
      if (!this.selectedTache.labels) {
        this.selectedTache.labels = [];
      }
      this.selectedTache.labels = [color];
      for (const column of this.colonnes) {
        const taskIndex = column.taches.findIndex(t => t.idTache === this.selectedTache.idTache);
        if (taskIndex > -1) {
          column.taches[taskIndex].labels = [color];
          break;
        }
      }
      if (this.selectedTache.idTache) {
        this.tacheService.updateCoverColor(this.selectedTache.idTache, color).subscribe({
          next: (updatedTache) => {
          },
          error: (err) => {
            console.error('Error updating cover color:', err);
          }
        });
      }
      this.cdRef.detectChanges();
    }
  }

  updateTaskColor(event: {id: number, color: string}): void {
    for (const column of this.colonnes) {
      const task = column.taches.find(t => t.idTache === event.id);
      if (task) {
        task.labels = [event.color];
        break;
      }
    }
    this.cdRef.detectChanges();
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

/* KanbanBoardComponent */
setActiveSection(section: string) {
  console.log('Section ->', section);     // #1
  this.activeSection      = section;
  this.showGroupsSection  = section === 'Groups';
  this.showClassesSection = section === 'Levels';
  this.showThemesSection  = section === 'Themes';

  if (this.showClassesSection) { this.loadClasses(); }
  if (this.showThemesSection)  { 
       console.log('[loadThemes] will fire');  // #2
       this.loadThemes();  
  }
}





  setActiveBoard(boardId: number): void {
    if (this.activeBoard === boardId) {
      return;
    }

    this.isLoading = true;
    this.activeBoard = boardId;

    // Simulate API load delay
    setTimeout(() => {
      this.loadBoardData(boardId);
      this.isLoading = false;
    }, 300);
  }

  loadBoardData(boardId: number): void {
    const selectedBoard = this.boards.find(board => board.id === boardId);

    if (!selectedBoard) {
      console.error('Board not found');
      return;
    }

    this.currentProjectName = selectedBoard.name;

    // Reset with sample data for the selected board
    this.colonnes = [
      {
        titre: "ToDo",
        taches: [
          {
            idTache: 1,
            titreTache: `Task 1 for Board ${boardId}`,
            descriptionTache: 'Sample task description',
            statut: 'ToDo',
            members: [],
            labels: ['green'],
            checklist: [],
            sousTaches: []
          }
        ]
      },
      {
        titre: "EnCours",
        taches: [
          {
            idTache: 2,
            titreTache: `Task 2 for Board ${boardId}`,
            descriptionTache: 'Sample in progress task',
            statut: 'EnCours',
            members: [],
            labels: ['blue'],
            checklist: [],
            sousTaches: []
          }
        ]
      }
    ];

    this.connectedColumns = this.colonnes.map(colonne => colonne.titre);
    this.selectedTache = this.createEmptyTache();
    this.showTaskDetails = false;
    this.resetForm();
  }
/* ---------------- THEMES ---------------- */
loadThemes(): void {
  this.isLoading = true;
  this.themeService.getAllThemes().subscribe({
    next: ts => { this.themes = ts; this.isLoading = false; },
    error: err => { console.error(err); this.isLoading = false; }
  });
}

resetNewTheme(): void {
  this.newTheme = { titreTheme: '', description: '', disponible: true };
}
saveTheme(): void {
  this.themeService.ajouterTheme(this.newTheme).subscribe({
    next: t => {
      this.themes.push(t);          // MAJ liste locale
      this.isAddingTheme = false;
      this.resetNewTheme();
    },
    error: err => console.error(err)
  });
}

  private resetBoardState(): void {
    this.previousBoardId = this.activeBoard;
    this.colonnes = [];
    this.connectedColumns = [];
    this.selectedTache = this.createEmptyTache();
    this.showTaskDetails = false;
    this.resetForm();
  }

  // Classes functionality methods
  loadClasses(): void {
    this.isLoading = true;
    this.classeService.getAllClasses().subscribe({
      next: (data) => {
        this.classes = data;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur lors du chargement des classes:', err);
        this.isLoading = false;
      }
    });
  }

  startAddingClasse(): void {
    this.isAddingClasse = true;
    this.newClasse = { idCLasse: 0, nomClasse: '' };
  }

  cancelAddingClasse(): void {
    this.isAddingClasse = false;
  }

  saveNewClasse(): void {
    if (this.newClasse.nomClasse.trim()) {
      this.classeService.ajouterClasse(this.newClasse).subscribe({
        next: () => {
          this.loadClasses();
          this.isAddingClasse = false;
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout de la classe:', err);
        }
      });
    }
  }

  editClasse(classe: Classe): void {
    this.selectedClasse = { ...classe };
    this.isEditingClasse = true;
  }

  saveClasse(): void {
    if (this.selectedClasse) {
      this.classeService.modifierClasse(this.selectedClasse.idCLasse, this.selectedClasse).subscribe({
        next: () => {
          this.loadClasses();
          this.cancelEditClasse();
        },
        error: (err) => {
          console.error('Erreur lors de la modification de la classe:', err);
        }
      });
    }
  }

  cancelEditClasse(): void {
    this.selectedClasse = null;
    this.isEditingClasse = false;
  }

  deleteClasse(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette classe?')) {
      this.classeService.supprimerClasse(id).subscribe({
        next: () => {
          this.loadClasses();
        },
        error: (err) => {
          console.error('Erreur lors de la suppression de la classe:', err);
        }
      });
    }
  }

  // Groups functionality methods
  get activeGroups(): Group[] {
    return this.groups.filter(group => group.isActive);
  }

  get allGroups(): Group[] {
    return this.groups;
  }

  openGroupPopup(): void {
    this.showGroupPopup = true;
  }

  closeGroupPopup(): void {
    this.showGroupPopup = false;
  }

  onGroupSaved(group: any): void {
    // Convert the group data to match your Group interface
    const newGroup: Group = {
      id: Math.max(...this.groups.map(g => g.id), 0) + 1,
      name: group.nomGroupe,
      description: group.visibilite || 'No description', // Use visibility as description
      members: group.membres || [],
      isActive: true,
      createdDate: new Date()
    };
    this.groups.push(newGroup);

    //to force the change detection
    this.cdRef.detectChanges();
  }

  editGroup(group: Group): void {
    // You can implement edit functionality here
    console.log('Edit group:', group);
  }

  toggleGroupStatus(group: Group): void {
    group.isActive = !group.isActive;
    this.cdRef.detectChanges();
  }

  deleteGroup(groupId: number): void {
    this.groups = this.groups.filter(g => g.id !== groupId);
    this.cdRef.detectChanges();
  }
  /* ---------- THEMES : helpers ---------- */
startEditTheme(t: ThemeChoix): void {
  this.selectedTheme = { ...t };          // clone
  this.isEditingTheme = true;
}

cancelEditTheme(): void {
  this.selectedTheme = null;
  this.isEditingTheme = false;
}

/* PUT */
updateTheme(): void {
  if (!this.selectedTheme) { return; }
  if (this.selectedTheme.idTheme !== undefined) {
    this.themeService.modifierTheme(this.selectedTheme.idTheme, this.selectedTheme)
        .subscribe({
          next: updated => {
            // remplace l’ancien objet dans le tableau
            const idx = this.themes.findIndex(th => th.idTheme === updated.idTheme);
            if (idx > -1) { this.themes[idx] = updated; }
            this.cancelEditTheme();
          },
          error: err => console.error(err)
        });
  } else {
    console.error('idTheme is undefined for selectedTheme');
  }
}

/* DELETE */
deleteTheme(id: number): void {

  /* —— 1) Confirmation —— */
  if (!confirm('Supprimer ce thème ?')) { return; }

  /* —— 2) Préparation des headers avec JWT —— */
  const token = localStorage.getItem('token');               // adapte si tu stockes ailleurs
  const headers = token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();                                   // pas de token → headers vides

  /* —— 3) Appel API —— */
  this.themeService.supprimerTheme(id, { headers }).subscribe({

    /* —— 4) Succès —— */
    next: () => {
      // a) mise à jour immédiate de la liste locale
      this.themes = this.themes.filter(t => t.idTheme !== id);

      // b) puis rafraîchissement complet depuis le backend pour être sûr
      this.loadThemes();

      console.log(`[deleteTheme] thème ${id} supprimé`);
    },

    /* —— 5) Erreur —— */
    error: (err) => {
      console.error('[deleteTheme] erreur', err);
      if (err.status === 401) {
        alert('Session expirée : reconnecte-toi pour continuer.');
        // redirige éventuellement vers la page de login
      } else {
        alert('Impossible de supprimer le thème : ' + (err.error || err.message));
      }
    }
  });
}


}
