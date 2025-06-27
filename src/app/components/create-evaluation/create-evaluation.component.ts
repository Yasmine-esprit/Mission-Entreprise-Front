import { Component } from '@angular/core';

@Component({
  selector: 'app-create-evaluation',
  templateUrl: './create-evaluation.component.html',
  styleUrls: ['./create-evaluation.component.css']
})
export class CreateEvaluationComponent {

  evaluation = {
    teacher: '',
    class: '',
    date: '',
    groupNumber: 1,
    groupName: '',
    criteria: ''
  };

  classes = ['4SE 1', '4SE 2', '4SE 3'];
  groupNames = ['Group 1', 'Group 2', 'Group 3'];
  criteria = ['PIDEV-SE Sprint 1 & 2', 'Mini Project', 'Final Presentation'];

  isGroup = true;

  groupCriteria = [
    { label: 'AA7 - Multitier Architecture', max: 10, score: 0, comment: '' },
    { label: 'AA6 - Tech Choices', max: 6, score: 0, comment: '' },
    { label: 'AA5 - Collaboration Tool', max: 2, score: 0, comment: '' },
    { label: 'Integration [+GIT]', max: 2, score: 0, comment: '' }
  ];

  groupComment = '';

  individualCriteria = [
    { label: 'Back-End (4 pts)', max: 4 },
    { label: 'Front-End (2 pts)', max: 2 },
    { label: 'Excellence (2 pts)', max: 2 },
    { label: 'Ergonomics (2 pts)', max: 2 },
    { label: 'AA6 (6 pts)', max: 6 },
    { label: 'AA5 (2 pts)', max: 2 },
    { label: 'Integration [+GIT] (2 pts)', max: 2 }
  ];

  students = [
    { name: 'Ahmed Salah', scores: [0, 0, 0, 0, 0, 0, 0], finalGrade: 0 },
    { name: 'Sara Ben Ali', scores: [0, 0, 0, 0, 0, 0, 0], finalGrade: 0 },
    { name: 'Mohamed Karim', scores: [0, 0, 0, 0, 0, 0, 0], finalGrade: 0 },
    { name: 'Leila Mansour', scores: [0, 0, 0, 0, 0, 0, 0], finalGrade: 0 }
  ];

  individualComment = '';

  updateFinalGrade(student: any) {
    student.finalGrade = student.scores.reduce((sum: number, val: number) => sum + (+val || 0), 0);
  }

  saveEvaluation() {
    // Validate form
    if (
      !this.evaluation.teacher || !this.evaluation.class || !this.evaluation.date ||
      !this.evaluation.groupName || !this.evaluation.criteria
    ) {
      alert('Please fill all Evaluation Information fields.');
      return;
    }

    if (this.isGroup) {
      const invalid = this.groupCriteria.some(c => c.score === null || c.score < 0);
      if (invalid) {
        alert('Please fill all scores in Group Evaluation.');
        return;
      }
    } else {
      const incomplete = this.students.some(s => s.scores.some(v => v === null || v === undefined));
      if (incomplete) {
        alert('Please fill all student scores in Individual Evaluation.');
        return;
      }
    }

    alert('Evaluation saved successfully!');
    // Trigger backend call or emit output here
  }

  
}
