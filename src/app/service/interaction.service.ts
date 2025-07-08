import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Interaction {
  idInteraction: number;
  contenuInteraction: string;
  dateInteraction: string;
  authorName: string | null;
  postId: number;
}

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  private baseUrl = 'http://localhost:8081/api/interactions';

  constructor(private http: HttpClient) {}

  getByPostId(postId: number): Observable<Interaction[]> {
    return this.http.get<Interaction[]>(`${this.baseUrl}/post/${postId}`);
  }

  likeInteraction(interactionId: number, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${interactionId}/like`, { userId });
  }

  createInteraction(request: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, request);
  }
} 