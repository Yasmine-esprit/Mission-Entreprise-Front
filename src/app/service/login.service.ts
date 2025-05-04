import { Injectable } from '@angular/core';
import { AuthenticationRequest } from '../models/authentication-request';
import { AuthenticationResponse } from '../models/authentication-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { jwtDecode } from 'jwt-decode';

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
  isLoggedIn(): boolean {
    return !!localStorage.getItem('jwtToken');
  }
  getUserRole(): string | null {
    const token = localStorage.getItem('jwtToken');
    if (!token) return null;
  
    try {
      const decoded: any = jwtDecode(token);
      console.log(decoded)
      return decoded.roles   || null;
    } catch (error) {
      return null;
    }
  }

  sendResetLink(payload: any): Observable<any> {
    return this.http.post('http://localhost:8081/auth/forget', payload, {
      responseType: 'text' 
    });
  }

  resetPassword(token: string, newPassword: string) {
    const resetPasswordRequest = {
      password: newPassword
    };
    console.log("inside service token ", token , "pass " ,resetPasswordRequest )
    return this.http.post(`http://localhost:8081/auth/reset-password/${token}`, resetPasswordRequest, {
      responseType: 'text' 
    });
  }


  verify2FA(twoFactorRequest: any): Observable<any> {
    return this.http.post<any>("http://localhost:8081/auth/verify-2fa", twoFactorRequest);
  }
  
  
  
}
