import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { LoginService } from './login.service';
import { UserDTO } from '../models/user-dto';
import {BehaviorSubject, throwError} from 'rxjs';
import {catchError, map, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UserService {
   private currentUserSubject = new BehaviorSubject<UserDTO | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

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

  return this.http.delete<any>(`${this.apiUrl}${id}`, { headers ,  responseType: 'text' as 'json' });
}

UpdateUser(id: number, updateUser: any): Observable<any> {
  const token = this.loginService.getToken() || '';

  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  });

  // Since apiUrl ends with '/', no need to add extra '/'
  const url = `${this.apiUrl}${id}`;

  return this.http.put<any>(url, updateUser,{ headers ,  responseType: 'text' as 'json' });
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

  private getHeaders(): HttpHeaders {
    const token = this.loginService.getToken() || '';
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  //ajoutées par YassminT
  getEtudiants(): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}list/etudiants`, {
      headers: this.getHeaders()
    }).pipe(
      tap(data => console.log('Received data:', data)),
      catchError(error => {
        console.error('Error fetching students:', error);
        return throwError(error);
      })
    );
  }

  searchEtudiantsByName(searchTerm: string): Observable<UserDTO[]> {
    return this.http.get<UserDTO[]>(`${this.apiUrl}/EtudiantByName`,
      {
        params: { searchTerm },
        headers: this.getHeaders()
      }
    );
  }

}
