// evaluation.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EvaluationsDetailsComponent } from '../components/evaluations-details/evaluations-details.component';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = 'http://localhost:8089/api/evaluation'; 

  constructor(private http: HttpClient) { }

  // Fetch all evaluations
  getEvaluations(): Observable<EvaluationsDetailsComponent[]> {
    return this.http.get<EvaluationsDetailsComponent[]>(this.apiUrl);
  }

  // Get a single evaluation by ID
  getEvaluationById(id: number): Observable<EvaluationsDetailsComponent> {
    return this.http.get<EvaluationsDetailsComponent>(`${this.apiUrl}/${id}`);
  }

  // Create a new evaluation
  createEvaluation(evaluation: EvaluationsDetailsComponent): Observable<EvaluationsDetailsComponent> {
    return this.http.post<EvaluationsDetailsComponent>(this.apiUrl, evaluation);
  }

  // Update an evaluation
  updateEvaluation(id: number, evaluation: EvaluationsDetailsComponent): Observable<EvaluationsDetailsComponent> {
    return this.http.put<EvaluationsDetailsComponent>(`${this.apiUrl}/${id}`, evaluation);
  }

  // Delete an evaluation
  deleteEvaluation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}