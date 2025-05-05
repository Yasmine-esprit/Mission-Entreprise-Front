import { Component, OnInit } from '@angular/core';
import { ProjetService } from 'src/app/services/projet.service';
import { Projet } from 'src/app/models/projet.model';

@Component({
  selector: 'app-projet',
  templateUrl: './projet.component.html'
})
export class ProjetComponent implements OnInit {
  projets: Projet[] = [];
  newProjet: Projet = {
    titreProjet: '',
    descriptionProjet: '',
    visibilite: 'PUBLIQUE',
    statut: 'Terminé',
    dateCreation: new Date().toISOString().substring(0, 10)
  };

  constructor(private projetService: ProjetService) {}

  ngOnInit(): void {
    this.getProjets();
  }

  getProjets() {
    this.projetService.getAll().subscribe(data => this.projets = data);
  }

  addProjet() {
    this.projetService.add(this.newProjet).subscribe(() => {
      this.getProjets();
      this.newProjet = {
        titreProjet: '',
        descriptionProjet: '',
        visibilite: 'PUBLIQUE',
        statut: 'Terminé',
        dateCreation: new Date().toISOString().substring(0, 10)
      };
    });
  }

  deleteProjet(id: number) {
    this.projetService.delete(id).subscribe(() => this.getProjets());
  }
}
