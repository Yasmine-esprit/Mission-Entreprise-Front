import {Component, ChangeDetectorRef, OnInit} from '@angular/core';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import {Router} from "@angular/router";
import {Tache} from "../../models/tache.model";
import { Projet } from '../../models/projet.model';
import { sousTache } from '../../models/sousTache.model';

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
  sousTaches?: sousTache[];
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
export class KanbanBoardComponent implements OnInit {
  selectedTache!: Tache; // Using non-null assertion
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
          labels: ['green'],
          checklist: []
        },
        {
          idTache: 2,
          titreTache: 'Créer le modèle',
          assigneA: 'Feten',
          descriptionTache: 'Modèle UML',
          statut: 'ToDo',
          members: ['Feten'],
          labels: ['blue'],
          checklist: []
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
          checklist: []
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
          checklist: []
        }
      ]
    }
  ];

  constructor(private router: Router, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Alternative initialization approach
    // this.selectedTache = this.createEmptyTache();
  }

  ouvrirTache(tacheId: number) {
    this.router.navigate(['/tache', tacheId]);
  }

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
    // Ensure the type conversion is explicit here
    this.selectedTache = { ...tache } as Tache;
    this.showTaskDetails = true;
    this.cdRef.detectChanges();
  }

  closeTacheDetails(): void {
    // Don't set to null - either use undefined or initialize an empty object
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
      statut: 'ToDo',
      members: [],
      labels: [],
      checklist: []
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

  updateTacheDescription(newDescription: string): void {
    if (this.selectedTache) {
      this.selectedTache.descriptionTache = newDescription;
      console.log('Description mise à jour:', newDescription);
      this.cdRef.detectChanges();
    }
  }
}
