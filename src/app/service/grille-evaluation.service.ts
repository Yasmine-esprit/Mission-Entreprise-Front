import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GrilleEvaluation } from '../models/grille-evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class GrilleEvaluationService {
  private apiUrl = 'http://localhost:8081/api/grilles'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<GrilleEvaluation[]> {
    return this.http.get<GrilleEvaluation[]>(this.apiUrl);
  }

  create(grille: GrilleEvaluation): Observable<GrilleEvaluation> {
    return this.http.post<GrilleEvaluation>(this.apiUrl, grille);
  }
}