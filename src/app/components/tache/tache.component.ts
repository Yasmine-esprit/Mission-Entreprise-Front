import {Component, OnInit} from '@angular/core';
import { Tache } from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';
import { ActivatedRoute, Router } from '@angular/router';

type StatutTache = "ToDo" | "EnCours" | "Terminé" | "Test" | "Validé" | "Annulé";

@Component({
  selector: 'app-tache',
  templateUrl: './tache.component.html',
  styleUrls: ['./tache.component.css']
})
export class TacheComponent implements OnInit {
  tache: Tache | null = null;
  editingDescription = false;
  tempDescription = '';

  constructor(
    private tacheService: TacheService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.chargerTache(+id);
    }
  }

  chargerTache(id: number): void {
    this.tacheService.getTacheById(id).subscribe(t => {
      if (t) {
        this.tache = {
          ...t,
          members: t.assigneA ? [t.assigneA] : [],
          checklist: t.checklist || [],
          labels: t.labels || ['green'],
          statut: this.validateStatut(t.statut)
        };
        this.tempDescription = this.tache.descriptionTache;
      }
    });
  }

  editDescription(): void {
    this.editingDescription = true;
  }

  saveDescription(): void {
    if (this.tache) {
      this.editingDescription = false;
      this.tempDescription = this.tache.descriptionTache;
      this.tacheService.updateTache(this.tache).subscribe();
    }
  }

  cancelEditDescription(): void {
    if (this.tache) {
      this.tache.descriptionTache = this.tempDescription;
      this.editingDescription = false;
    }
  }

  deleteTache(): void {
    if (this.tache?.idTache) {
      this.tacheService.deleteTache(this.tache.idTache).subscribe(() => {
        this.router.navigate(['/']);
      });
    }
  }

  getStatutValues(): StatutTache[] {
    return ["ToDo", "EnCours", "Terminé", "Test", "Validé", "Annulé"];
  }

  private validateStatut(statut: any): StatutTache {
    const statutsValides: StatutTache[] = ["ToDo", "EnCours", "Terminé", "Test", "Validé", "Annulé"];
    return statutsValides.includes(statut) ? statut : "ToDo";
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  retour(): void {
    this.router.navigate(['/']);
  }
}
