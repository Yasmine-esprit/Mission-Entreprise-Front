import { Component, OnInit } from '@angular/core';
import { Tache } from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';

type StatutTache = "ToDo" | "EnCours" | "Terminé" | "Test" | "Validé" | "Annulé";

@Component({
  selector: 'app-tache',
  templateUrl: './tache.component.html',
  styleUrls: ['./tache.component.css']
})
export class TacheComponent implements OnInit {
  taches: Tache[] = [];
  selectedTache: Tache | null = null;
  editingDescription = false;
  tempDescription = '';

  isEditing = false;
  isAddingTask = false;
  newTache: Tache = this.resetTache();

  constructor(private tacheService: TacheService) {}

  ngOnInit(): void {
    this.loadTaches();
  }

  loadTaches(): void {
    this.tacheService.getAllTaches().subscribe(data => {
      this.taches = data.map(t => ({
        ...t,
        members: t.assigneA ? [t.assigneA] : [],
        checklist: t.checklist || [],
        labels: t.labels || ['green', 'blue'],
        statut: this.validateStatut(t.statut)
      }));
    });
  }

  private validateStatut(statut: any): StatutTache {
    const statutsValides: StatutTache[] = ["ToDo", "EnCours", "Terminé", "Test", "Validé", "Annulé"];
    return statutsValides.includes(statut) ? statut : "ToDo";
  }

  getStatutValues(): StatutTache[] {
    return ["ToDo", "EnCours", "Terminé", "Test", "Validé", "Annulé"];
  }

  getTachesByStatut(statut: string): Tache[] {
    return this.taches.filter(t => t.statut === statut);
  }

  openTacheDetails(tache: Tache): void {
    this.selectedTache = {
      ...tache,
      checklist: tache.checklist || [],
      members: tache.members || [],
      statut: this.validateStatut(tache.statut)
    };
    this.tempDescription = tache.descriptionTache;
    this.editingDescription = false;
  }

  closeTacheDetails(): void {
    if (this.selectedTache) {
      this.tacheService.updateTache(this.selectedTache).subscribe(() => {
        this.loadTaches();
      });
    }
    this.selectedTache = null;
  }

  editDescription(): void {
    this.editingDescription = true;
  }

  saveDescription(): void {
    this.editingDescription = false;
    if (this.selectedTache) {
      this.tacheService.updateTache(this.selectedTache).subscribe();
    }
  }

  cancelEditDescription(): void {
    if (this.selectedTache) {
      this.selectedTache.descriptionTache = this.tempDescription;
    }
    this.editingDescription = false;
  }

  initNewTask(columnTitle: string): void {
    this.newTache = {
      ...this.resetTache(),
      statut: this.validateStatut(columnTitle)
    };
    this.isAddingTask = true;
    this.isEditing = false;
  }

  saveTache(): void {
    if (this.newTache.titreTache.trim() === '') return;

    if (this.isEditing && this.newTache.idTache) {
      this.tacheService.updateTache({
        ...this.newTache,
        statut: this.validateStatut(this.newTache.statut)
      }).subscribe(() => {
        this.loadTaches();
        this.resetForm();
      });
    } else {
      const ids = this.taches.map(t => t.idTache).filter(id => id !== undefined) as number[];
      const newId = ids.length > 0 ? Math.max(...ids) + 1 : 1;

      this.tacheService.addTache({
        ...this.newTache,
        idTache: newId,
        statut: this.validateStatut(this.newTache.statut)
      }).subscribe(() => {
        this.loadTaches();
        this.resetForm();
      });
    }
  }

  editTache(tache: Tache): void {
    this.isEditing = true;
    this.isAddingTask = false;
    this.newTache = {
      ...tache,
      statut: this.validateStatut(tache.statut)
    };
    this.closeTacheDetails();
  }

  deleteTache(id: number | undefined): void {
    if (id) {
      this.tacheService.deleteTache(id).subscribe(() => {
        this.loadTaches();
        this.closeTacheDetails();
      });
    }
  }

  resetForm(): void {
    this.isAddingTask = false;
    this.isEditing = false;
    this.newTache = this.resetTache();
  }

  private resetTache(): Tache {
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
