import { Injectable } from '@angular/core';
import { AuthenticationRequest } from '../models/authentication-request';
import { AuthenticationResponse } from '../models/authentication-response';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http'
import { jwtDecode } from 'jwt-decode';
import {tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private apiUrl = 'http://localhost:8081/auth/authenticate';

  constructor(private http: HttpClient) {}

  login(request: AuthenticationRequest): Observable<AuthenticationResponse> {
    return this.http.post<AuthenticationResponse>(this.apiUrl, request);
  }

  private validateToken(token: string | null): boolean {
    if (!token) return false;

    try {
      const parts = token.split('.');
      const isValid = parts.length === 3 &&
        parts[0].length > 0 &&
        parts[1].length > 0 &&
        parts[2].length > 0;

      if (!isValid) {
        console.error('Invalid JWT format - incorrect segment structure');
      }
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  storeToken(token: string): void {
    if (this.validateToken(token)) {
      localStorage.setItem('jwtToken', token);
    } else {
      console.error('Attempted to store invalid JWT token');
      throw new Error('Invalid JWT token format');
    }
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

  enableUser(email: string): Observable<string> {
    return this.http.put(`http://localhost:8081/auth/enable/${email}`, {}, { responseType: 'text' });
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
