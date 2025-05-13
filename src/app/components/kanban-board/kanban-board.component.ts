import { Component, ChangeDetectorRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

type StatutTache = "ToDo" | "EnCours" | "Terminé" | "Test" | "Validé" | "Annulé";

interface Task {
  idTache: number;
  titreTache: string;
  descriptionTache: string;
  assigneA: string;
  statut: StatutTache;
  dateDebut?: string;
  dateFin?: string;
  checklist?: { text: string, completed: boolean }[];
  members?: string[];
  labels?: string[];
}

interface Column {
  titre: StatutTache;
  taches: Task[];
}

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent {
  selectedTache: Task | null = null;
  isEditing = false;
  isAddingTask = false;
  editingDescription = false;
  tempDescription = '';

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
          labels: ['green']
        },
        {
          idTache: 2,
          titreTache: 'Créer le modèle',
          assigneA: 'Feten',
          descriptionTache: 'Modèle UML',
          statut: 'ToDo',
          members: ['Feten'],
          labels: ['blue']
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
          labels: ['red']
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
          labels: ['green', 'blue']
        }
      ]
    }
  ];

  constructor(private cdRef: ChangeDetectorRef) {}

  get connectedColumns(): string[] {
    return this.colonnes.map(colonne => colonne.titre);
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

  openTacheDetails(tache: Task): void {
    this.selectedTache = { ...tache };
  }

  closeTacheDetails(): void {
    this.selectedTache = null;
  }

  editDescription(): void {
    this.tempDescription = this.selectedTache?.descriptionTache || '';
    this.editingDescription = true;
  }

  saveDescription(): void {
    this.editingDescription = false;
    if (this.selectedTache) {
      this.saveTask(this.selectedTache);
    }
  }

  cancelEditDescription(): void {
    if (this.selectedTache) {
      this.selectedTache.descriptionTache = this.tempDescription;
    }
    this.editingDescription = false;
  }

  editTache(tache: Task): void {
    this.isEditing = true;
    this.newTache = { ...tache };
    this.closeTacheDetails();
  }

  deleteTache(id: number): void {
    this.colonnes.forEach(colonne => {
      colonne.taches = colonne.taches.filter(t => t.idTache !== id);
    });
    this.closeTacheDetails();
  }

  saveTacheForm(): void {
    if (this.newTache.titreTache.trim() === '') return;

    if (this.isEditing && this.newTache.idTache > 0) {
      const colonne = this.colonnes.find(c => c.titre === this.newTache.statut);
      if (colonne) {
        const index = colonne.taches.findIndex(t => t.idTache === this.newTache.idTache);
        if (index !== -1) {
          colonne.taches[index] = { ...this.newTache };
        }
      }
    } else {
      const newId = Math.max(0, ...this.colonnes.flatMap(c => c.taches.map(t => t.idTache))) + 1;
      this.newTache.idTache = newId;
      const targetColumn = this.colonnes.find(c => c.titre === this.newTache.statut);
      if (targetColumn) {
        targetColumn.taches.unshift({ ...this.newTache });
      }
    }
    this.resetForm();
  }

  resetForm(): void {
    this.isAddingTask = false;
    this.isEditing = false;
    this.newTache = this.resetTache();
  }

  getStatutValues(): StatutTache[] {
    return ["ToDo", "EnCours", "Terminé", "Test", "Validé", "Annulé"];
  }

  initNewTask(columnTitle: StatutTache): void {
    this.newTache = {
      ...this.resetTache(),
      statut: columnTitle
    };
    this.isAddingTask = true;
    this.isEditing = false;
  }

  private resetTache(): Task {
    return {
      idTache: 0,
      titreTache: '',
      descriptionTache: '',
      assigneA: '',
      statut: 'ToDo',
      checklist: [],
      members: [],
      labels: []
    };
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }
}
