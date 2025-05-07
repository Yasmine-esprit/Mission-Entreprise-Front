import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class UserService {

 constructor(private http: HttpClient) {}
 private apiUrl = 'http://localhost:8081/users'; 
 
 getAllUsers() : Observable<any>{
   const token = localStorage.getItem('jwtToken');  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
  
      return this.http.get<any>(`${this.apiUrl}`, { headers })

 }
}
