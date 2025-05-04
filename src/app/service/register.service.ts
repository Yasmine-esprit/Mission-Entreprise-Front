import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  

  constructor(private http: HttpClient) {}

  register(formData: FormData): Observable<string> {
    return this.http.post('http://localhost:8081/auth/register', formData, {
      responseType: 'text' as 'text' // 👈 this tells Angular to expect plain text
    });
  }
  
}
