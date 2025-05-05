import { Component, OnInit } from '@angular/core';
import { sousTacheService } from 'src/app/service/sousTache.service';
import { sousTache, Statut } from '../../models/sousTache.model';

@Component({
  selector: 'app-sous-tache',
  templateUrl: './sous-tache.component.html'
})
export class SousTacheComponent implements OnInit {
  sousTaches: sousTache[] = [];
  newSousTache: sousTache = {
    titreSousTache: '',
    descriptionSousTache: ''
  };
  statutEnum = Object.values(Statut);

  constructor(private sousTacheService: sousTacheService) {}

  ngOnInit(): void {
    this.loadSousTaches();
  }

  loadSousTaches(): void {
    this.sousTacheService.getAll().subscribe(data => {
      this.sousTaches = data;
    });
  }

  addSousTache(): void {
    this.sousTacheService.create(this.newSousTache).subscribe(() => {
      this.loadSousTaches();
      this.newSousTache = { titreSousTache: '', descriptionSousTache: '' };
    });
  }

  deleteSousTache(id: number): void {
    this.sousTacheService.delete(id).subscribe(() => this.loadSousTaches());
  }
}
