import { Component, OnInit } from '@angular/core';
import { Tache } from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';

@Component({
  selector: 'app-tache',
  templateUrl: './tache.component.html',
  styleUrls: ['./tache.component.css']
})
export class TacheComponent implements OnInit {
  taches: Tache[] = [];
  selectedTache: Tache | null = null;

  isEditing = false;
  newTache: Tache = this.resetTache();

  constructor(private tacheService: TacheService) {}

  ngOnInit(): void {
    this.loadTaches();
  }

  loadTaches(): void {
    this.tacheService.getAllTaches().subscribe(data => {
      this.taches = data;
    });
  }

  getStatutValues(): string[] {
    return ['ToDo', 'EnCours', 'Terminé'];
  }

  getTachesByStatut(statut: string): Tache[] {
    return this.taches.filter(t => t.statut === statut);
  }

  openTacheDetails(tache: Tache): void {
    this.selectedTache = { ...tache };
  }

  closeTacheDetails(): void {
    this.selectedTache = null;
  }

  saveTache(): void {
    if (this.isEditing && this.newTache.idTache) {
      this.tacheService.updateTache(this.newTache).subscribe(() => {
        this.loadTaches();
        this.cancelEdit();
      });
    } else {
      this.tacheService.addTache(this.newTache).subscribe(() => {
        this.loadTaches();
        this.newTache = this.resetTache();
      });
    }
  }

  editTache(tache: Tache): void {
    this.isEditing = true;
    this.newTache = { ...tache };
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.newTache = this.resetTache();
  }

  deleteTache(id: number | undefined): void {
    this.tacheService.deleteTache(id).subscribe(() => {
      this.loadTaches();
      this.closeTacheDetails();
    });
  }

  private resetTache(): Tache {
    return {
      idTache: 0,
      titreTache: '',
      descriptionTache: '',
      assigneA: '',
      //dateDebut: '',
      //dateFin: '',
      statut: 'ToDo'
    };
  }
}
