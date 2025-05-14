import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
private apiUrl = 'http://localhost:8081/groupes'; // update with your backend endpoint

  constructor(private http: HttpClient , private loginService: LoginService) {}

  getGroupes(): Observable<any> {
    const token = this.loginService.getToken() || '';
    
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Here, token will never be null
    });
  
    return this.http.get<any>(`${this.apiUrl}/getGroups`, { headers });
  }

    // Delete a group
    deleteGroup(groupId: number): Observable<any> {
      const token = this.loginService.getToken() || '';
    
    
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}` // Here, token will never be null
    });
  
      return this.http.delete<any>(`${this.apiUrl}/${groupId}`, { headers });
    }

    creerGroupe(userIds: number[]): Observable<any> {
      const token = this.loginService.getToken();
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
    
      return this.http.post(`${this.apiUrl}/creeGroupe`, userIds, {
        headers,
        responseType: 'text' as 'json'
      });
    }
    
  

}
