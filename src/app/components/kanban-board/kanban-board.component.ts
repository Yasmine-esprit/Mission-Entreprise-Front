import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Router } from "@angular/router";
import { Tache, StatutTache, PrioriteTache } from "../../models/tache.model";
import { Projet } from '../../models/projet.model';
import { sousTache } from '../../models/sousTache.model';
import { TacheService } from "../../service/tache.service";
import { finalize } from 'rxjs/operators';
import { HttpHeaders } from "@angular/common/http";
import { LoginService } from "../../service/login.service";
import {Groupe} from "../../models/groupe.model";
import {GroupeService} from "../../service/groupe.service";

interface Column {
  titre: StatutTache;
  taches: Tache[];
}

interface Group {
  id: number;
  name: string;
  description: string;
  members: any[];
  isActive: boolean;
  createdDate: Date;
}

interface Board {
  color: any;
  id: number;
  name: string;
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent implements OnInit {
  selectedTache: Tache = this.createEmptyTache();
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
  isLoading = false;
  connectedColumns: string[] = [];
  showGroupsSection = false;
  activeBoard = 0;
  previousBoardId = 0;
  showGroupPopup = false;
  localTaches: Tache[] = [];
  private lastLocalId = 0;

  activeGroups: Groupe[] = [];
  allGroups: Groupe[] = [];

  colonnes: Column[] = [];
  boards: Board[] = [];
  groups: Group[] = [];

  newTache: Tache = this.createEmptyTache();

  constructor(
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private tacheService: TacheService,
    private loginService: LoginService,
    private groupeService: GroupeService
  ) {}

  ngOnInit(): void {
    this.loadTaches();
    this.boards = [
      { id: 1, name: "Projet 1", color: "Red" },
      { id: 2, name: "Projet 2", color: "Blue" }
    ];
    console.log('Auth token:', localStorage.getItem('authToken'));
    console.log('All localStorage:', localStorage);
  }

  loadTaches(): void {
    this.isLoading = true;
    this.tacheService.getAllTaches()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdRef.detectChanges();
      }))
      .subscribe({
        next: (tasks: Tache[]) => {
          const statutGroups: { [key in StatutTache]?: Tache[] } = {};

          // Add backend tasks
          tasks.forEach(task => {
            const statut = task.statut || 'ToDo';
            if (!statutGroups[statut]) {
              statutGroups[statut] = [];
            }
            statutGroups[statut]?.push(task);
          });

          // Add local unsynchronized tasks (those with no idTache)
          this.localTaches.forEach(localTask => {
            const statut = localTask.statut || 'ToDo';
            if (!statutGroups[statut]) {
              statutGroups[statut] = [];
            }
            statutGroups[statut]?.push(localTask);
          });

          this.colonnes = (["ToDo", "INPROGRESS", "DONE", "Test", "VALIDATED", "CANCELED"] as const).map(statut => ({
            titre: statut,
            taches: statutGroups[statut] ?? []
          }));

          this.connectedColumns = this.colonnes.map(col => col.titre);
        },
        error: (err) => {
          console.error('Erreur chargement tâches:', err);
        }
      });
  }

  drop(event: CdkDragDrop<Tache[]>) {
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

      // Mark as having pending changes if it's a local task
      if (this.isLocalTask(transferredTask)) {
        transferredTask.pendingChanges = true;
        transferredTask.lastUpdated = new Date();

        // Update local tasks array
        const localIndex = this.localTaches.findIndex(t => this.areTasksEqual(t, transferredTask));
        if (localIndex !== -1) {
          this.localTaches[localIndex] = transferredTask;
        } else {
          this.localTaches.push(transferredTask);
        }
      } else if (transferredTask.idTache) {
        // Sync immediately if it's a backend task
        this.tacheService.updateTache(transferredTask).subscribe({
          next: () => {
            console.log('Tâche mise à jour avec nouveau statut');
          },
          error: (err) => {
            console.error('Erreur mise à jour tâche:', err);
          }
        });
      }
    }
    this.cdRef.detectChanges();
  }

  private isLocalTask(task: Tache): boolean {
    return task.isLocal || (!task.idTache && task.pendingChanges === true);
  }

  // Utility method to check equality of tasks (based on title + description + no idTache)
  private areTasksEqual(t1: Tache, t2: Tache): boolean {
    // For local tasks without id, you can define a way to identify them uniquely
    return t1.idTache === t2.idTache &&
      t1.titreTache === t2.titreTache &&
      t1.descriptionTache === t2.descriptionTache;
  }

  createQuickTask(statut: StatutTache, titre: string): void {
    if (!titre.trim()) {
      titre = 'Nouvelle tâche';
    }

    this.lastLocalId++; // Increment the local ID counter

    const newTask: Tache = {
      idTache: this.lastLocalId,  // Use the auto-incremented local ID
      titreTache: titre.trim(),
      descriptionTache: '',
      dateDebut: null,
      dateFin: null,
      statut: statut,
      priorite: null,
      assigneA: null,
      labels: ['white'],
      members: [],
      checklist: [],
      sousTaches: [],
      lastUpdated: new Date(),
      pendingChanges: true,
      isLocal: true  // Add this flag to distinguish local tasks
    };

    // Store the task locally
    this.localTaches.push(newTask);

    // Add to the appropriate column
    const column = this.colonnes.find(col => col.titre === statut);
    if (column) {
      column.taches.unshift(newTask);
    }

    this.cdRef.detectChanges();
  }

  // Function called when clicking "Add Task" with a quick title
  startAddingTask(statut: StatutTache): void {
    const titre = prompt('Titre de la tâche:');
    if (titre !== null) { // null if user cancels
      this.createQuickTask(statut, titre);
    }
  }

  // Save a local task to backend
  saveLocalTaskToBackend(task: Tache): void {
    if (!this.isLocalTask(task)) {
      console.error('Cette tâche n\'est pas une tâche locale');
      return;
    }

    // Remove idTache so backend assigns it
    const { idTache, ...taskForBackend } = task;

    this.tacheService.addTache(taskForBackend as Tache).subscribe({
      next: (createdTache: Tache) => {
        console.log('Tâche synchronisée avec le backend:', createdTache);

        // Remove the local task (which had undefined id)
        this.localTaches = this.localTaches.filter(t => t !== task);

        // Replace in columns the local task with backend task
        const column = this.colonnes.find(col => col.titre === task.statut);
        if (column) {
          // Replace the local task instance with backend task instance in column
          const index = column.taches.indexOf(task);
          if (index !== -1) {
            column.taches[index] = createdTache;
          } else {
            column.taches.push(createdTache);
          }
        }

        // Update selected task if it was the local task
        if (this.selectedTache === task) {
          this.selectedTache = createdTache;
        }

        this.cdRef.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors de la synchronisation:', err);
        alert('Erreur lors de la sauvegarde de la tâche');
      }
    });
  }

  saveTask(task: Tache): void {
    if (this.isLocalTask(task)) {
      // Prepare object without idTache for backend creation
      const { idTache, ...taskToCreate } = task;

      this.tacheService.addTache(taskToCreate as Tache).subscribe({
        next: (createdTask: Tache) => {
          console.log('Task created successfully:', createdTask);

          // Replace local task with backend version
          const column = this.colonnes.find(col => col.titre === task.statut);
          if (column) {
            const index = column.taches.indexOf(task);
            if (index !== -1) {
              column.taches[index] = createdTask;
            }
          }

          // Remove from local tasks array
          this.localTaches = this.localTaches.filter(t => t !== task);

          // Update selected task if it's the same
          if (this.selectedTache === task) {
            this.selectedTache = createdTask;
          }

          this.cdRef.detectChanges();
        },
        error: (err: any) => {
          console.error('Erreur création tâche', err);
          alert('Erreur lors de la création de la tâche');
        }
      });
    } else if (task.idTache) {
      this.tacheService.updateTache(task).subscribe({
        next: (updatedTask: Tache) => {
          console.log('Task updated successfully');
          if (updatedTask) {
            const column = this.colonnes.find(col => col.titre === task.statut);
            if (column) {
              const index = column.taches.findIndex(t => t.idTache === task.idTache);
              if (index !== -1) {
                column.taches[index] = updatedTask;
              }
            }
          }
          this.cdRef.detectChanges();
        },
        error: (err: any) => {
          console.error('Erreur mise à jour tâche', err);
          alert('Erreur lors de la mise à jour de la tâche');
        }
      });
    }
  }

  onTaskSaved(savedTask: Tache): void {
    // Remove local task if it exists
    this.localTaches = this.localTaches.filter(t => t !== this.selectedTache);

    // Update in the column
    const column = this.colonnes.find(col => col.titre === savedTask.statut);
    if (column) {
      const index = column.taches.findIndex(t => t === this.selectedTache);
      if (index !== -1) {
        column.taches[index] = savedTask;
      }
    }
    this.selectedTache = savedTask;

    this.cdRef.detectChanges();
  }

  openTacheDetails(tache: Tache, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedTache = { ...tache };
    this.router.navigate(['/task', tache.idTache], {
      state: { task: this.selectedTache }
    });
  }

  closeTacheDetails(): void {
    this.selectedTache = this.createEmptyTache();
    this.showTaskDetails = false;
    this.editingDescription = false;
    this.cdRef.detectChanges();
  }

  private createEmptyTache(): Tache {
    return {
      titreTache: '',
      descriptionTache: '',
      dateDebut: null,
      dateFin: null,
      statut: 'ToDo',
      priorite: null,
      assigneA: null,
      labels: [],
      members: [],
      checklist: [],
      sousTaches: []
    };
  }

  deleteTache(id: number): void {
    // Check if task is local by id presence
    const localIndex = this.localTaches.findIndex(t => t.idTache === id);
    if (localIndex !== -1) {
      // Delete a local task
      const localTask = this.localTaches[localIndex];
      this.localTaches.splice(localIndex, 1);
      this.colonnes.forEach(col => {
        col.taches = col.taches.filter(t => t !== localTask);
      });
      this.closeTacheDetails();
      this.cdRef.detectChanges();
    } else {
      // Delete a backend task
      this.tacheService.deleteTache(id).subscribe({
        next: () => {
          console.log('Tâche supprimée');
          this.loadTaches();
          this.closeTacheDetails();
        },
        error: (err) => {
          console.error('Erreur suppression tâche:', err);
        }
      });
    }
  }

  initNewTask(statut: StatutTache): void {
    this.lastLocalId++; // Increment the local ID counter

    const newTask: Tache = {
      idTache: this.lastLocalId,
      titreTache: '',
      descriptionTache: '',
      dateDebut: null,
      dateFin: null,
      statut: statut,
      priorite: null,
      assigneA: null,
      labels: ['white'],
      members: [],
      checklist: [],
      sousTaches: [],
      pendingChanges: true,
      isLocal: true
    };

    const column = this.colonnes.find(col => col.titre === statut);
    if (column) {
      column.taches.push(newTask);
    }

    this.localTaches.push(newTask);

    // Navigate directly to task component for new task
    this.router.navigate(['/task', newTask.idTache], {
      state: { task: newTask }
    });
  }

  saveTacheForm(): void {
    if (!this.newTache.titreTache.trim()) {
      this.newTache.titreTache = 'Nouvelle tâche';
    }

    this.tacheService.addTache(this.newTache).subscribe({
      next: (createdTache) => {
        console.log('Tâche créée via formulaire:', createdTache);

        const targetColumn = this.colonnes.find(col => col.titre === createdTache.statut);
        if (targetColumn) {
          targetColumn.taches.push(createdTache);
        }

        this.isAddingTask = false;
        this.resetForm();
        this.openTacheDetails(createdTache, new MouseEvent('click'));
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Erreur création tâche:', err);
        alert('Erreur lors de la création de la tâche');
      }
    });
  }

  resetForm(): void {
    this.newTache = this.createEmptyTache();
    this.isAddingTask = false;
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
    if (!this.selectedTache || !this.selectedTache.idTache) {
      console.error('Impossible de sauvegarder: tâche ou ID invalide');
      return;
    }

    this.editingDescription = false;

    if (this.isLocalTask(this.selectedTache)) {
      // Update local task
      this.selectedTache.lastUpdated = new Date();
      this.selectedTache.pendingChanges = true;
      const localIndex = this.localTaches.findIndex(t => t === this.selectedTache);
      if (localIndex !== -1) {
        this.localTaches[localIndex] = this.selectedTache;
      }
    } else {
      // Update backend task
      this.tacheService.updateTache(this.selectedTache).subscribe({
        next: () => {
          console.log('Description mise à jour');
          this.loadTaches();
        },
        error: (err) => {
          console.error('Erreur mise à jour description:', err);
        }
      });
    }
  }

  updateTacheDescription(description: string): void {
    if (this.selectedTache?.idTache) {
      this.selectedTache.descriptionTache = description;

      if (this.isLocalTask(this.selectedTache)) {
        this.selectedTache.lastUpdated = new Date();
        this.selectedTache.pendingChanges = true;
        const localIndex = this.localTaches.findIndex(t => t === this.selectedTache);
        if (localIndex !== -1) {
          this.localTaches[localIndex] = this.selectedTache;
        }
      } else {
        this.tacheService.updateTache(this.selectedTache).subscribe({
          next: () => {
            console.log('Description mise à jour');
            this.loadTaches();
          },
          error: (err) => console.error('Erreur:', err)
        });
      }
    }
  }

  updateTaskFromComponent(updatedTask: Tache): void {
    if (updatedTask.isLocal) {
      // Find and update the local task
      const index = this.localTaches.findIndex(t => t.idTache === updatedTask.idTache);
      if (index !== -1) {
        this.localTaches[index] = updatedTask;
      }

      // Update in the appropriate column
      const column = this.colonnes.find(col => col.titre === updatedTask.statut);
      if (column) {
        const taskIndex = column.taches.findIndex(t => t.idTache === updatedTask.idTache);
        if (taskIndex !== -1) {
          column.taches[taskIndex] = updatedTask;
        }
      }
    } else {
      this.loadTaches();
    }

    this.cdRef.detectChanges();
  }

  updateTaskColor(event: { id: number, color: string }): void {
    const tache = this.findTacheInColumns(event.id);
    if (tache) {
      tache.coverColor = event.color;

      if (this.isLocalTask(tache)) {
        tache.lastUpdated = new Date();
        tache.pendingChanges = true;
        const localIndex = this.localTaches.findIndex(t => t === tache);
        if (localIndex !== -1) {
          this.localTaches[localIndex] = tache;
        }
      } else {
        this.tacheService.updateTache(tache).subscribe({
          next: () => {
            console.log('Couleur mise à jour');
            this.loadTaches();
          },
          error: (err) => {
            console.error('Erreur mise à jour couleur:', err);
          }
        });
      }
    }
  }

  private findTacheInColumns(id: number): Tache | undefined {
    for (const col of this.colonnes) {
      const tache = col.taches.find(t => t.idTache === id);
      if (tache) return tache;
    }
    return undefined;
  }


setCoverColor(color: string): void {
    this.selectedCoverColor = color;

    if (this.selectedTache && this.selectedTache.idTache) {
      this.selectedTache.coverColor = color;
      this.updateTaskColor({ id: this.selectedTache.idTache, color });
    }
  }

  getPendingTasks(): Tache[] {
    return Array.from(this.localTaches.values()).filter(task => task.pendingChanges);
  }

  // Méthode pour synchroniser toutes les tâches locales
  syncAllLocalTasks(): void {
    const pendingTasks = this.getPendingTasks();
    pendingTasks.forEach(task => {
      this.saveLocalTaskToBackend(task);
    });
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  setActiveSection(section: string) {
    this.activeSection = section;
    this.showGroupsSection = section === 'Groups';
  }

  setActiveBoard(boardId: number): void {
    if (this.activeBoard === boardId) {
      return;
    }

    this.isLoading = true;
    this.activeBoard = boardId;

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

    this.colonnes = [
      {
        titre: "ToDo",
        taches: [
          {
            idTache: 1,
            titreTache: `Task 1 for Board ${boardId}`,
            descriptionTache: 'Sample task description',
            dateDebut: null,
            dateFin: null,
            statut: 'ToDo',
            priorite: null,
            assigneA: null,
            members: [],
            labels: ['green'],
            checklist: [],
            sousTaches: []
          }
        ]
      },
      {
        titre: "CANCELED",
        taches: [
          {
            idTache: 2,
            titreTache: `Task 2 for Board ${boardId}`,
            descriptionTache: 'Sample in progress task',
            dateDebut: null,
            dateFin: null,
            statut: 'ToDo',
            priorite: null,
            assigneA: null,
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


  openGroupPopup(): void {
    this.showGroupPopup = true;
  }

  closeGroupPopup(): void {
    this.showGroupPopup = false;
  }

  onGroupSaved(newGroup: Groupe): void {
    if (this.isGroupActive(newGroup)) {
      this.activeGroups = [...this.activeGroups, newGroup];
    }
    this.allGroups = [...this.allGroups, newGroup];
    this.showGroupPopup = false;
  }


  toggleGroupStatus(group: Group): void {
    group.isActive = !group.isActive;
    this.cdRef.detectChanges();
  }



  loadGroups(): void {
    this.groupeService.getAll().subscribe({
      next: (groups: Groupe[]) => {
        this.activeGroups = groups.filter(g => this.isGroupActive(g));
        this.allGroups = groups;
        console.log('Loaded groups:', groups); // Debug log
      },
    });
  }

  private isGroupActive(group: Groupe): boolean {
    return !!group.projet;
  }

  getMemberCount(group: Groupe): number {
    return group.etudiants?.length || 0;
  }



  startAddingList(): void {
    this.isAddingList = true;
    this.newListTitle = '';
  }

  addNewList(): void {
    if (!this.newListTitle.trim()) {
      alert('Le titre de la liste est obligatoire.');
      return;
    }
  }
}
