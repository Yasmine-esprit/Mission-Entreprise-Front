import { Component } from '@angular/core';
import { LoginService } from '../service/login.service';
import { AuthenticationRequest } from '../models/authentication-request';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService : LoginService){}

  onLogin(): void {
    const request: AuthenticationRequest = {
      email: this.email,
      password: this.password
    };


    this.authService.login(request).subscribe({
      next: (response) => {
        this.authService.storeToken(response.token);
        console.log('Login successful');
        this.errorMessage='';
        
      },
      error: (err) => {
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password.';
        } else if (err.status === 403) {
          this.errorMessage = 'Account is disabled. Please verify your email.';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
      }
    });
  }
}
