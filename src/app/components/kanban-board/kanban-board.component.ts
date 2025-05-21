import {Component, ChangeDetectorRef, ViewEncapsulation} from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {Router} from "@angular/router";

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
  //encapsulation: ViewEncapsulation.None
})
export class KanbanBoardComponent {
  selectedTache: Task | null = null;
  showTaskDetails = false;
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
  constructor(private router: Router, private cdRef: ChangeDetectorRef) {}

  ouvrirTache(tacheId: number) {
    this.router.navigate(['/tache', tacheId]);
  }


  //constructor(private cdRef: ChangeDetectorRef) {}

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

  openTacheDetails(tache: Task, event: MouseEvent): void {
    event.stopPropagation();
    this.selectedTache = { ...tache };
    this.showTaskDetails = true;
    this.cdRef.detectChanges(); // Ajout critique ici
  }

  closeTacheDetails(): void {
    this.selectedTache = null;
    this.showTaskDetails = false;
    this.editingDescription = false;
    this.cdRef.detectChanges(); // pour bien forcer l’UI à se mettre à jour
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
      // Normalement tu enregistres côté backend ici
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
      labels: [],
      members: []
    };
    this.isAddingTask = true;
  }

  saveTacheForm(): void {
    const colonne = this.colonnes.find(col => col.titre === this.newTache.statut);
    if (colonne) {
      colonne.taches.push({ ...this.newTache });
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
      labels: [],
      members: []
    };
  }
 
   isPhasesOpen = false;
   isLevelsOpen = false;
   isTeamsOpen = false;


}
