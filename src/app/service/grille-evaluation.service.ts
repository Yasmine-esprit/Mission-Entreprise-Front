import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { GrilleEvaluation } from '../models/grille-evaluation.model';
import { Critere } from '../models/critere.model';
import { CreateEvaluationRequest } from '../shared/types/evaluation.types';

@Injectable({
  providedIn: 'root'
})
export class GrilleEvaluationService extends BaseHttpService {
  private evaluationListSubject = new BehaviorSubject<GrilleEvaluation[]>([]);
  public evaluationList$ = this.evaluationListSubject.asObservable();

  // CREATE
  createEvaluation(evaluationData: CreateEvaluationRequest): Observable<GrilleEvaluation> {
    const payload = {
      teacher: evaluationData.teacher,
      nomEvaluation: evaluationData.nomEvaluation,
      dateEvaluation: new Date(evaluationData.dateEvaluation),
      typeEval: evaluationData.typeEval
    };

    return this.post<GrilleEvaluation>('/evaluations', payload)
      .pipe(
        tap(() => this.refreshEvaluationList())
      );
  }

  createMultipleEvaluations(evaluations: CreateEvaluationRequest[]): Observable<GrilleEvaluation[]> {
    const payload = evaluations.map(evalua => ({
      teacher: evalua.teacher,
      nomEvaluation: evalua.nomEvaluation,
      dateEvaluation: new Date(evalua.dateEvaluation),
      typeEval: evalua.typeEval
    }));

    return this.post<GrilleEvaluation[]>('/evaluations/batch', payload)
      .pipe(
        tap(() => this.refreshEvaluationList())
      );
  }

  // READ
  getAllEvaluations(): Observable<GrilleEvaluation[]> {
    return this.get<GrilleEvaluation[]>('/evaluations')
      .pipe(
        tap(evaluations => this.evaluationListSubject.next(evaluations))
      );
  }

  getEvaluationById(id: number): Observable<GrilleEvaluation> {
    return this.get<GrilleEvaluation>(`/evaluations/${id}`);
  }

  getEvaluationsByType(type: string): Observable<GrilleEvaluation[]> {
    return this.get<GrilleEvaluation[]>(`/evaluations/by-type/${type}`);
  }

  getCriteresByEvaluation(id: number): Observable<Critere[]> {
    return this.get<Critere[]>(`/evaluations/${id}/criteres`);
  }

  // UPDATE
  updateEvaluation(id: number, evaluationData: Partial<CreateEvaluationRequest>): Observable<GrilleEvaluation> {
    const payload = {
      ...evaluationData,
      dateEvaluation: evaluationData.dateEvaluation ? new Date(evaluationData.dateEvaluation) : undefined
    };

    return this.put<GrilleEvaluation>(`/evaluations/${id}`, payload)
      .pipe(
        tap(() => this.refreshEvaluationList())
      );
  }

  updateMultipleEvaluations(evaluations: GrilleEvaluation[]): Observable<GrilleEvaluation[]> {
    return this.put<GrilleEvaluation[]>('/evaluations/batch', evaluations)
      .pipe(
        tap(() => this.refreshEvaluationList())
      );
  }

  // DELETE
  deleteEvaluation(id: number): Observable<void> {
    return this.delete<void>(`/evaluations/${id}`)
      .pipe(
        tap(() => this.refreshEvaluationList())
      );
  }

  deleteEvaluationByObject(evaluation: GrilleEvaluation): Observable<void> {
    return this.post<void>('/evaluations', evaluation)
      .pipe(
        tap(() => this.refreshEvaluationList())
      );
  }

  deleteAllEvaluations(): Observable<void> {
    return this.delete<void>('/evaluations/all')
      .pipe(
        tap(() => this.evaluationListSubject.next([]))
      );
  }

  // UTILITY
  evaluationExists(id: number): Observable<boolean> {
    return this.get<boolean>(`/evaluations/exists/${id}`);
  }

  countEvaluations(): Observable<number> {
    return this.get<number>('/evaluations/count');
  }

  // SEARCH & FILTER
  searchEvaluations(searchTerm: string): Observable<GrilleEvaluation[]> {
    return this.evaluationList$.pipe(
      map(evaluations => evaluations.filter(evaluation => 
        evaluation.nomEvaluation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        evaluation.teacher.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  filterEvaluationsByDateRange(startDate: Date, endDate: Date): Observable<GrilleEvaluation[]> {
    return this.evaluationList$.pipe(
      map(evaluations => evaluations.filter(evaluation => {
        const evalDate = new Date(evaluation.dateEvaluation);
        return evalDate >= startDate && evalDate <= endDate;
      }))
    );
  }

  private refreshEvaluationList(): void {
    this.getAllEvaluations().subscribe();
  }
}
