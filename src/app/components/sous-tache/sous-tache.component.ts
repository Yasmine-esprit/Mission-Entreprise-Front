import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { sousTache, Statut } from "../../models/sousTache.model";

@Component({
  selector: 'app-sub-task',
  templateUrl: './sous-tache.component.html',
  styleUrls: ['./sous-tache.component.css']
})
export class SousTacheComponent implements OnInit {
  @Input() sousTache!: sousTache;
  @Input() sousTaches: sousTache[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() saveChanges = new EventEmitter<sousTache>();
  @Output() deleteSousTache = new EventEmitter<number>();

  private alreadySaved = false;
  titreSousTache: string = '';
  descriptionSousTache: string = '';
  dateDebut: string = '';
  statut?: Statut;

  statutValues = Object.values(Statut);

  ngOnInit(): void {
    if (this.sousTache) {
      this.titreSousTache = this.sousTache.titreSousTache;
      this.descriptionSousTache = this.sousTache.descriptionSousTache || '';
      this.dateDebut = this.sousTache.dateDebut || new Date().toISOString().slice(0, 10);
      this.statut = this.sousTache.statut;
    }
  }

  save(): void {
    const updatedSousTache: sousTache = {
      ...this.sousTache,
      titreSousTache: this.titreSousTache,
      descriptionSousTache: this.descriptionSousTache,
      dateDebut: this.dateDebut,
      statut: this.statut
    };

    this.saveChanges.emit(updatedSousTache);
    this.closeModal.emit();
  }

  cancel(): void {
    this.closeModal.emit();
  }

  close(): void {
    this.closeModal.emit();
  }

  delete(): void {
    if (this.sousTache.idSousTache !== undefined) {
      if (confirm('Do you confirm deleting this sub-task ?')) {
        this.deleteSousTache.emit(this.sousTache.idSousTache);
      }
    }
  }
}


