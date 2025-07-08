import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import { Groupe } from '../models/groupe.model';
import {LoginService} from "./login.service";
import {catchError} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class GroupeService {
  private baseUrl = 'http://localhost:8081/api/groupe';

  constructor(private http: HttpClient, private loginService: LoginService) {
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwtToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getHttpOptions() {
    return {
      headers: this.getHeaders(),

      withCredentials: true
    };
  }

  getAll(): Observable<Groupe[]> {
    return this.http.get<Groupe[]>(`${this.baseUrl}/groupes`, this.getHttpOptions())
  }

  addWithStudentsByEmail(data: any): Observable<any> {
    console.log("Request payload:", JSON.stringify(data));
    return this.http.post(`${this.baseUrl}/AddGroupeWithStudentsByEmail`, data, this.getHttpOptions()).pipe(
      catchError(error => {
        console.error('API Error:', error);
        return throwError(() => error);
      })
    );
  }

  update(groupe: Groupe): Observable<Groupe> {
    return this.http.put<Groupe>(`${this.baseUrl}/Editgroupe/${groupe.idGroupe}`, groupe, this.getHttpOptions())
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Deletegroupe/${id}`, {
      headers: this.getHttpOptions().headers,
      responseType: 'text'
    });
  }

  getById(id: number): Observable<Groupe> {
    return this.http.get<Groupe>(`${this.baseUrl}/groupe/${id}`, this.getHttpOptions())
  }

  deleteAll(): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/Deletegroupes`, this.getHttpOptions())
  }

  createGroupe(request: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/create`, request);
  }
}
