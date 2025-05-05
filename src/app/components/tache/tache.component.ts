import { Component, OnInit } from '@angular/core';
import { Tache} from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';
import {Statut} from "../../models/sousTache.model";

@Component({
  selector: 'app-tache',
  templateUrl: './tache.component.html'
})
export class TacheComponent implements OnInit {
  taches: Tache[] = [];
  newTache: Tache = this.initTache();
  isEditing = false;

  constructor(private tacheService: TacheService) {}

  ngOnInit(): void {
    this.loadTaches();
  }

  initTache(): Tache {
    return {
      titreTache: '',
      descriptionTache: '',
      dateDebut: undefined,
      dateFin: undefined,
      statut: Statut.ToDo
    };
  }

  loadTaches(): void {
    this.tacheService.getAllTaches().subscribe(data => this.taches = data);
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
        this.newTache = this.initTache();
      });
    }
  }

  editTache(tache: Tache): void {
    this.newTache = { ...tache };
    this.isEditing = true;
  }

  deleteTache(id: number | undefined): void {
    if (id) {
      this.tacheService.deleteTache(id).subscribe(() => this.loadTaches());
    }
  }

  cancelEdit(): void {
    this.newTache = this.initTache();
    this.isEditing = false;
  }

  getStatutValues(): string[] {
    return Object.values(Statut);
  }
}
