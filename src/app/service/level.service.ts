import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Level } from '../models/level.model';

@Injectable
({ providedIn: 'root' })
export class LevelService {
  private apiUrl = 'http://localhost:8080/api/levels';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Level[]> {
    return this.http.get<Level[]>(this.apiUrl);
  }

  create(level: Level): Observable<Level> {
    return this.http.post<Level>(this.apiUrl, level);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
