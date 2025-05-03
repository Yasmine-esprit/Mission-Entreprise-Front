import { Injectable } from '@angular/core';
import { AuthenticationRequest } from '../models/authentication-request';
import { AuthenticationResponse } from '../models/authentication-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:8081/auth/authenticate'; // update with your backend endpoint

  constructor(private http: HttpClient) {}

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(this.apiUrl, request);
  }

  storeToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }

  logout(): void {
    localStorage.removeItem('jwtToken');
  }
}
