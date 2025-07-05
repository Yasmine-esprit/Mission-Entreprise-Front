import { Component, OnInit } from '@angular/core';

interface SubCriteria {
  id: string;
  name: string;
  description?: string;
  maxPoints: number;
  selectedLevel: string;
  pointRange: string;
  levelDescription: string;
}

interface Criteria {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  subCriteria: SubCriteria[];
}

interface EvaluationCriteria {
  title: string;
  code: string;
  description: string;
  evaluationType: string;
  totalPoints: number;
  criteria: Criteria[];
}

@Component({
  selector: 'app-evaluation-criteria',
  templateUrl: './create-critere.component.html',
  styleUrls: ['./create-critere.component.css']
})
export class CreateCritereComponent implements OnInit {

  evaluationCriteria: EvaluationCriteria = {
    title: '',
    code: '',
    description: '',
    evaluationType: 'both',
    totalPoints: 20,
    criteria: []
  };

  // Modal state
  isModalOpen = false;
  currentCriteriaId: string | null = null;
  
  // Sub-criteria form
  subCriteriaForm = {
    name: '',
    description: '',
    maxPoints: 5,
    selectedLevel: 'A',
    pointRange: '5-4 points',
    levelDescription: 'Excellent'
  };

  // Evaluation type options
  evaluationTypes = [
    { value: 'both', label: 'Both Individual and Group' },
    { value: 'individual', label: 'Individual Only' },
    { value: 'group', label: 'Group Only' }
  ];

  // Grading levels configuration
  levelConfigs = {
    'A': { range: '5-4 points', description: 'Excellent' },
    'B': { range: '4-3 points', description: 'Good' },
    'C': { range: '3-2 points', description: 'Fair' },
    'D': { range: '2-1 points', description: 'Needs Improvement' }
  };

  gradingLevels = ['A', 'B', 'C', 'D'];

  private criteriaCounter = 0;
  private subCriteriaCounter = 0;

  constructor() { }

  ngOnInit(): void {
    // Initialize component
  }

  // Criteria management
  addCriteria(): void {
    this.criteriaCounter++;
    const newCriteria: Criteria = {
      id: `criteria-${this.criteriaCounter}`,
      title: `Criteria ${this.criteriaCounter}`,
      description: '',
      maxPoints: 10,
      subCriteria: []
    };
    
    this.evaluationCriteria.criteria.push(newCriteria);
  }

  deleteCriteria(criteriaId: string): void {
    if (confirm('Are you sure you want to delete this criteria?')) {
      this.evaluationCriteria.criteria = this.evaluationCriteria.criteria.filter(
        criteria => criteria.id !== criteriaId
      );
    }
  }

  // Sub-criteria management
  openSubCriteriaModal(criteriaId: string): void {
    this.currentCriteriaId = criteriaId;
    this.isModalOpen = true;
    this.resetSubCriteriaForm();
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.currentCriteriaId = null;
    this.resetSubCriteriaForm();
  }

  resetSubCriteriaForm(): void {
    this.subCriteriaForm = {
      name: '',
      description: '',
      maxPoints: 5,
      selectedLevel: 'A',
      pointRange: '5-4 points',
      levelDescription: 'Excellent'
    };
  }

  selectLevel(level: string): void {
    this.subCriteriaForm.selectedLevel = level;
    const config = this.levelConfigs[level as keyof typeof this.levelConfigs];
    this.subCriteriaForm.pointRange = config.range;
    this.subCriteriaForm.levelDescription = config.description;
  }

  addSubCriteria(): void {
    if (!this.currentCriteriaId || !this.subCriteriaForm.name.trim()) {
      alert('Please enter a name for the sub-criteria');
      return;
    }

    this.subCriteriaCounter++;
    const newSubCriteria: SubCriteria = {
      id: `subcriteria-${this.subCriteriaCounter}`,
      name: this.subCriteriaForm.name.trim(),
      description: this.subCriteriaForm.description.trim(),
      maxPoints: this.subCriteriaForm.maxPoints,
      selectedLevel: this.subCriteriaForm.selectedLevel,
      pointRange: this.subCriteriaForm.pointRange,
      levelDescription: this.subCriteriaForm.levelDescription.trim()
    };

    const criteria = this.evaluationCriteria.criteria.find(
      c => c.id === this.currentCriteriaId
    );
    
    if (criteria) {
      criteria.subCriteria.push(newSubCriteria);
    }

    this.closeModal();
  }

  deleteSubCriteria(criteriaId: string, subCriteriaId: string): void {
    const criteria = this.evaluationCriteria.criteria.find(c => c.id === criteriaId);
    if (criteria) {
      criteria.subCriteria = criteria.subCriteria.filter(
        sub => sub.id !== subCriteriaId
      );
    }
  }

  // Form actions
  saveCriteria(): void {
    if (!this.evaluationCriteria.title.trim() || !this.evaluationCriteria.code.trim()) {
      alert('Please fill in the title and code fields');
      return;
    }

    // Here you would typically call your service to save the data
    console.log('Saving criteria:', this.evaluationCriteria);
    alert('Criteria saved successfully!');
  }

  // Utility methods
  get hasCriteria(): boolean {
    return this.evaluationCriteria.criteria.length > 0;
  }

  trackByCriteriaId(index: number, criteria: Criteria): string {
    return criteria.id;
  }

  trackBySubCriteriaId(index: number, subCriteria: SubCriteria): string {
    return subCriteria.id;
  }
}