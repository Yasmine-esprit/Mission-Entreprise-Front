import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-critere',
  templateUrl: './critere.component.html',
  styleUrls: ['./critere.component.css']
})
export class CritereComponent {
  constructor(private router: Router) {}
goToCreateCriteria() {
    this.router.navigate(['/createCritere']);
}


  searchText = '';

  criteriaList = [
    {
      title: 'PIDEV-SE Sprint 1 & 2',
      type: 'Individual evaluation criteria',
      main: 3,
      sub: 12,
      updated: '15 May 2024'
    },
    {
      title: 'Final Project Presentation',
      type: 'Group evaluation criteria',
      main: 4,
      sub: 8,
      updated: '10 May 2024'
    },
    {
      title: 'Code Quality Assessment',
      type: 'Individual evaluation criteria',
      main: 5,
      sub: 15,
      updated: '5 May 2024'
    }
  ];

  filteredCriteria() {
    return this.criteriaList.filter(criteria =>
      criteria.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
