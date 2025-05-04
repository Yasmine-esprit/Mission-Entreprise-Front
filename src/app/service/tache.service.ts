import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tache } from '../models/tache.model';

@Injectable({
  providedIn: 'root'
})
export class TacheService {
  private apiUrl = 'http://localhost:8081/missionEntreprise/tache';

  constructor(private http: HttpClient) {}

  getAllTaches(): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/all`);
  }

  getTacheById(id: number): Observable<Tache> {
    return this.http.get<Tache>(`${this.apiUrl}/get/${id}`);
  }

  addTache(tache: Tache): Observable<Tache> {
    return this.http.post<Tache>(`${this.apiUrl}/add`, tache);
  }

  updateTache(tache: Tache): Observable<Tache> {
    return this.http.put<Tache>(`${this.apiUrl}/update`, tache);
  }

  deleteTache(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
