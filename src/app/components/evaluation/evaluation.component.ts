import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluation',
  templateUrl: './evaluation.component.html',
  styleUrls: ['./evaluation.component.css']
})
export class EvaluationComponent {
  constructor(private router: Router) {}

  evaluations = [
    { title: 'Group 3 - Sprint 1', subtitle: '4SE - PIDEV Project' },
    { title: 'Group 1 - Sprint 2', subtitle: '4SE - PIDEV Project' },
    { title: 'Group 5 - Final Presentation', subtitle: '4SE - PIDEV Project' }
  ];

  goToCreateCriteria() {
    this.router.navigate(['/createCritere']);
  }

  goToNewEvaluation() {
    this.router.navigate(['/createEvaluation']);
  }

  goToEvaluations() {
    this.router.navigate(['/evalDetails']);
  }

  goToCriteria() {
    this.router.navigate(['/criteres']);
  }
}
