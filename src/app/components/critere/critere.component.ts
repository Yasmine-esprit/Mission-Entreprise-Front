import { Component } from '@angular/core';

@Component({
  selector: 'app-critere',
  templateUrl: './critere.component.html',
  styleUrls: ['./critere.component.css']
})
export class CritereComponent {


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
