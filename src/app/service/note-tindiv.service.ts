import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {NoteTIndiv } from '../models/note-tindiv.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrlIndiv = 'http://localhost:8081/api/notes-grp'; 

  constructor(private http: HttpClient) {}

  getAllIndiv(): Observable<NoteTIndiv[]> {
    return this.http.get<NoteTIndiv[]>(this.apiUrlIndiv);
  }
}

 
