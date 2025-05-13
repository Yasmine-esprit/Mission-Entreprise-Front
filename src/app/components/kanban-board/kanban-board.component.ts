import { Component } from '@angular/core';

@Component({
  selector: 'app-kanban-board',
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.css']
})
export class KanbanBoardComponent {
  tacheSelectionnee: any = null;

  colonnes = [
    {
      titre: 'To Do',
      taches: [
        { titre: 'Configurer le backend', assignee: 'Yas', description: 'Mettre en place Spring Boot', deadline: '15/05' },
        { titre: 'Créer le modèle', assignee: 'Feten', description: 'Modèle UML', deadline: '16/05' },
      ]
    },
    {
      titre: 'Doing',
      taches: [
        { titre: 'Design UI', assignee: 'Rima', description: 'Créer maquette Figma', deadline: '17/05' }
      ]
    },
    {
      titre: 'Done',
      taches: [
        { titre: 'Initialisation du projet', assignee: 'Hamza', description: 'Repo GitHub, Angular init', deadline: '12/05' }
      ]
    }
  ];

  ouvrirDetails(tache: any) {
    this.tacheSelectionnee = tache;
  }

  fermerDetails() {
    this.tacheSelectionnee = null;
  }
}
