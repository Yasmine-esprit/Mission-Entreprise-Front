import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

private apiUrl = 'http://localhost:8089/messages'; 

  constructor(private http: HttpClient , private loginService: LoginService) {}

  getMessagesByGroupId(groupId: number): Observable<any> {
    const token = localStorage.getItem('jwtToken');  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<any>(`${this.apiUrl}/messages/group/${groupId}`, { headers })
  
}
deleteMessageByGroupId(groupId: number): Observable<any> {
  const token = this.loginService.getToken() || '';


const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}` 
});

  return this.http.delete<any>(`${this.apiUrl}/${groupId}`, { headers });
}

envoyerMessage(groupeId: number, messageContent: string) {
  const token = this.loginService.getToken();

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  const body = {
    contenu: messageContent
  };

  return this.http.post(`${this.apiUrl}/envoyerMsg/${groupeId}`, body, { headers ,  responseType: 'text' as 'json' });
}

}
