import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { Critere } from '../models/critere.model';

export interface CritereCreateRequest {
  titreCritere: string;
  codeCritere: string;
  descriptionCritere: string;
  TotalPoints: number;
  mainCriteria?: Array<{
    descMainCritere: string;
    MaxPoints: number;
    sousCriteres?: Array<{
      nameSousCritere: string;
      maxPoints: number;
      gradingLevels: string;
      poinRangesSubCrit: number;
      descriptionSousCritere: string;
      noteMax: number;
    }>;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class CritereService extends BaseHttpService {
  private critereListSubject = new BehaviorSubject<Critere[]>([]);
  public critereList$ = this.critereListSubject.asObservable();

  // CREATE
  createCritere(critereData: CritereCreateRequest): Observable<Critere> {
    return this.post<Critere>('/criteres', critereData)
      .pipe(
        tap(() => this.refreshCritereList())
      );
  }

  createMultipleCriteres(criteres: CritereCreateRequest[]): Observable<Critere[]> {
    return this.post<Critere[]>('/criteres/batch', criteres)
      .pipe(
        tap(() => this.refreshCritereList())
      );
  }

  // READ
  getAllCriteres(): Observable<Critere[]> {
    return this.get<Critere[]>('/criteres')
      .pipe(
        tap(criteres => this.critereListSubject.next(criteres))
      );
  }

  getCritereById(id: number): Observable<Critere> {
    return this.get<Critere>(`/criteres/${id}`);
  }

  // UPDATE
  updateCritere(id: number, critereData: Partial<CritereCreateRequest>): Observable<Critere> {
    return this.put<Critere>(`/criteres/${id}`, critereData)
      .pipe(
        tap(() => this.refreshCritereList())
      );
  }

  updateMultipleCriteres(criteres: Critere[]): Observable<Critere[]> {
    return this.put<Critere[]>('/criteres/batch', criteres)
      .pipe(
        tap(() => this.refreshCritereList())
      );
  }

  // DELETE
  deleteCritere(id: number): Observable<void> {
    return this.delete<void>(`/criteres/${id}`)
      .pipe(
        tap(() => this.refreshCritereList())
      );
  }

  deleteCritereByObject(critere: Critere): Observable<void> {
    return this.post<void>('/criteres', critere)
      .pipe(
        tap(() => this.refreshCritereList())
      );
  }

  deleteAllCriteres(): Observable<void> {
    return this.delete<void>('/criteres/all')
      .pipe(
        tap(() => this.critereListSubject.next([]))
      );
  }

  // UTILITY
  critereExists(id: number): Observable<boolean> {
    return this.get<boolean>(`/criteres/exists/${id}`);
  }

  countCriteres(): Observable<number> {
    return this.get<number>('/criteres/count');
  }

  // SEARCH & FILTER
  searchCriteres(searchTerm: string): Observable<Critere[]> {
    return this.critereList$.pipe(
      map(criteres => criteres.filter(critere => 
        critere.titreCritere.toLowerCase().includes(searchTerm.toLowerCase()) ||
        critere.codeCritere.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
  }

  private refreshCritereList(): void {
    this.getAllCriteres().subscribe();
  }
}
