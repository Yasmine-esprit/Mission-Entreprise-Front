import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { Tache } from 'src/app/models/tache.model';
import { TacheService } from 'src/app/service/tache.service';
import { ActivatedRoute, Router } from '@angular/router';

type StatutTache = "ToDo" | "EnCours" | "Terminé" | "Test" | "Validé" | "Annulé";

@Component({
  selector: 'app-tache',
  templateUrl: './tache.component.html',
  styleUrls: ['./tache.component.css']
})
export class TacheComponent implements OnInit, OnChanges {
  editingDescription = false;
  tempDescription = '';
  @Input() tache!: Tache;
  @Output() fermer = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();
  @Output() updateDescription = new EventEmitter<string>();

  constructor(
    private tacheService: TacheService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && !this.tache) {
      this.chargerTache(+id);
    }

    if (this.tache) {
      this.tempDescription = this.tache.descriptionTache;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // React to changes in the input tache
    if (changes['tache'] && changes['tache'].currentValue) {
      console.log('Tache changed:', this.tache);
      this.tempDescription = this.tache.descriptionTache;
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
    this.tempDescription = this.tache?.descriptionTache || '';
  }

  saveDescription(): void {
    if (this.tache) {
      this.editingDescription = false;
      this.tempDescription = this.tache.descriptionTache;
      this.updateDescription.emit(this.tache.descriptionTache);

      // Only call service if we're in standalone mode (via router), not in popup mode
      if (this.route.snapshot.paramMap.get('id')) {
        this.tacheService.updateTache(this.tache).subscribe();
      }
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
      if (this.route.snapshot.paramMap.get('id')) {
        // In standalone mode
        this.tacheService.deleteTache(this.tache.idTache).subscribe(() => {
          this.router.navigate(['/']);
        });
      } else {
        // In popup mode
        this.delete.emit(this.tache.idTache);
      }
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
    if (this.route.snapshot.paramMap.get('id')) {
      // If we're on a standalone page
      this.router.navigate(['/']);
    } else {
      // If we're in a popup
      this.fermer.emit();
    }
  }
}
