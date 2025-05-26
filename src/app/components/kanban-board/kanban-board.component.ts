import { Component, ChangeDetectorRef, OnInit, EventEmitter } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from "@angular/router";
import { Tache } from "../../models/tache.model";
import { Projet } from '../../models/projet.model';
import { sousTache } from '../../models/sousTache.model';
import { TacheService } from "../../service/tache.service";

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
    private tacheService: TacheService
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

  setActiveSection(section: string) {
    this.activeSection = section;
    if (section === 'Groups') {
      this.showGroupsSection = true;
    } else {
      this.showGroupsSection = false;
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

  private resetBoardState(): void {
    this.previousBoardId = this.activeBoard;
    this.colonnes = [];
    this.connectedColumns = [];
    this.selectedTache = this.createEmptyTache();
    this.showTaskDetails = false;
    this.resetForm();
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

  onGroupSaved(group: Group): void {
    if (group.id === 0) {
      // New group
      const newId = Math.max(...this.groups.map(g => g.id)) + 1;
      group.id = newId;
      this.groups.push(group);
    } else {
      // Update existing group
      const index = this.groups.findIndex(g => g.id === group.id);
      if (index !== -1) {
        this.groups[index] = group;
      }
    }
    this.closeGroupPopup();
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
}
