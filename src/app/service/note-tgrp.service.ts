import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {NoteTGrp } from '../models/note-tgrp.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private apiUrlGrp = 'http://localhost:8081/api/notes-grp'; 

  constructor(private http: HttpClient) {}

  getAllGrp(): Observable<NoteTGrp[]> {
    return this.http.get<NoteTGrp[]>(this.apiUrlGrp);
  }
}