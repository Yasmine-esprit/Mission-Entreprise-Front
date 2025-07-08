import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluations-details',
  templateUrl: './evaluations-details.component.html',
  styleUrls: ['./evaluations-details.component.css']
})
export class EvaluationsDetailsComponent {


  constructor(private router: Router) {}

  evaluations = [
    { group: 'Group 3', project: 'PIDEV-SE', criteria: 'Sprint 1 & 2', date: '18 May 2024' },
    { group: 'Group 1', project: 'PIDEV-SE', criteria: 'Sprint 1 & 2', date: '17 May 2024' },
    { group: 'Ahmed Salah', project: 'PIDEV-SE', criteria: 'Code Quality', date: '15 May 2024' },
    { group: 'Group 5', project: 'PIDEV-SE', criteria: 'Final Presentation', date: '12 May 2024' }
  ];

  goToNewEvaluation() {
    this.router.navigate(['/createEvaluation']);
  }

  viewEvaluation(evaluation: any) {
    console.log('Viewing evaluation:', evaluation);
    // Replace with navigation if needed
  }
}
