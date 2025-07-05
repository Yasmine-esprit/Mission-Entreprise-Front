import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { LoginService } from './login.service';
import { UserDTO } from '../models/user-dto';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
   private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

 constructor(private http: HttpClient , private loginService : LoginService) {}
 private apiUrl = 'http://localhost:8089/users/'; 
 
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

  return this.http.delete<any>(`${this.apiUrl}${id}`, { headers ,  responseType: 'text' as 'json' });
}
UpdateUser(id: number, updateUser: any): Observable<any> {
  const token = this.loginService.getToken() || '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
  });

  return this.http.put<any>(`${this.apiUrl}${id}`, updateUser, { headers });
}


getUserById(id : number): Observable<any> {
  const token = this.loginService.getToken() || '';


const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}` 
});

  return this.http.get<any>(`${this.apiUrl}${id}`, { headers });
}
// user.service.ts  

getCurrentUser(): Observable<UserDTO> {
    const token = this.loginService.getToken() || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.get<UserDTO>(`${this.apiUrl}me`, { headers });
  }

getUsersGroupId(id : any): Observable<any> {
  const token = this.loginService.getToken() || '';


const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}` 
});

  return this.http.get<any>(`${this.apiUrl}by-group/${id}`, { headers });



}
uploadPhoto(userId: number, file: File): Observable<any> {
  const formData = new FormData();
  formData.append('file', file);

  const token = this.loginService.getToken() || '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    // Ne définis pas 'Content-Type' ici ! Angular le gère automatiquement pour FormData
  });

  return this.http.post(`${this.apiUrl}${userId}/upload-photo`, formData, { headers ,  responseType: 'text' as 'json' });
}


getUserPhoto(userId: number): Observable<Blob> {
   const token = this.loginService.getToken() || '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
    // Ne définis pas 'Content-Type' ici ! Angular le gère automatiquement pour FormData
  });
  return this.http.get(`${this.apiUrl}${userId}/photo`, {headers , responseType: 'blob' });
}
 // New method to set the user after login
  setCurrentUser(user: UserDTO) {
    this.currentUserSubject.next(user);
  }

  getStoredUser(): UserDTO | null {
    return this.currentUserSubject.value;
  }

 loadCurrentUser() {
    this.getCurrentUser().subscribe(user => {
      this.currentUserSubject.next(user);
    });
  }
  // à appeler après update
  refreshUser() {
    this.loadCurrentUser();
  }








}
