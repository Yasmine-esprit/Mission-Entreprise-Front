import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SousCritere } from '../models/sous-critere.model';

@Injectable({
  providedIn: 'root'
})
export class SousCritereService {
  private apiUrl = 'http://localhost:8081/api/sous-criteres'; 

  constructor(private http: HttpClient) {}

  getAll(): Observable<SousCritere[]> {
    return this.http.get<SousCritere[]>(this.apiUrl);
  }

  create(sousCritere: SousCritere): Observable<SousCritere> {
    return this.http.post<SousCritere>(this.apiUrl, sousCritere);
  }
}