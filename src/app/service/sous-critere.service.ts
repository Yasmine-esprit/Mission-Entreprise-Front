import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BaseHttpService } from './base-http.service';
import { SousCritere } from '../models/sous-critere.model';

@Injectable({
  providedIn: 'root'
})
export class SousCritereService extends BaseHttpService {
  private sousCritereListSubject = new BehaviorSubject<SousCritere[]>([]);
  public sousCritereList$ = this.sousCritereListSubject.asObservable();

  // CREATE
  createSousCritere(sousCritereData: Partial<SousCritere>): Observable<SousCritere> {
    return this.post<SousCritere>('/sous-criteres', sousCritereData)
      .pipe(
        tap(() => this.refreshSousCritereList())
      );
  }

  // READ
  getAllSousCriteres(): Observable<SousCritere[]> {
    return this.get<SousCritere[]>('/sous-criteres')
      .pipe(
        tap(sousCriteres => this.sousCritereListSubject.next(sousCriteres))
      );
  }

  getSousCritereById(id: number): Observable<SousCritere> {
    return this.get<SousCritere>(`/sous-criteres/${id}`);
  }

  searchSousCriteresByName(name: string): Observable<SousCritere[]> {
    return this.get<SousCritere[]>(`/sous-criteres/search?name=${name}`);
  }

  getSousCriteresByMainCriteria(mainCriteriaId: number): Observable<SousCritere[]> {
    return this.get<SousCritere[]>(`/sous-criteres/by-main-criteria/${mainCriteriaId}`);
  }

  // UPDATE
  updateSousCritere(id: number, sousCritereData: Partial<SousCritere>): Observable<SousCritere> {
    return this.put<SousCritere>(`/sous-criteres/${id}`, sousCritereData)
      .pipe(
        tap(() => this.refreshSousCritereList())
      );
  }

  // DELETE
  deleteSousCritere(id: number): Observable<void> {
    return this.delete<void>(`/sous-criteres/${id}`)
      .pipe(
        tap(() => this.refreshSousCritereList())
      );
  }

  private refreshSousCritereList(): void {
    this.getAllSousCriteres().subscribe();
  }
}