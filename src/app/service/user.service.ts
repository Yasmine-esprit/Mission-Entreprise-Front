import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { LoginService } from './login.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

 constructor(private http: HttpClient , private loginService : LoginService) {}
 private apiUrl = 'http://localhost:8081/users/'; 
 
 getAllUsers() : Observable<any>{
   const token = localStorage.getItem('jwtToken');  
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
  
      return this.http.get<any>(`${this.apiUrl}list`, { headers });


 }

DeleteUser(id: number): Observable<any> {
  const token = this.loginService.getToken() || '';


const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}` 
});

  return this.http.delete<any>(`${this.apiUrl}${id}`, { headers });
}

UpdateUser(id: number, updateUser: any): Observable<any> {
  const token = this.loginService.getToken() || '';


const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}` 
});

  return this.http.put<any>(`${this.apiUrl}${id}`, { headers });
}

getUserById(id : number): Observable<any> {
  const token = this.loginService.getToken() || '';


const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}` 
});

  return this.http.get<any>(`${this.apiUrl}${id}`, { headers });
}
getCurrentUser(): Observable<any> {
  const token = this.loginService.getToken() || '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}` // Add token in the headers
  });

  return this.http.get<any>(`${this.apiUrl}me`, { headers}); // Adjust URL if needed
}






}
