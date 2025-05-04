import { Component } from '@angular/core';
import { LoginService } from '../service/login.service';
import { AuthenticationRequest } from '../models/authentication-request';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService : LoginService,
              private router : Router
  ){}

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
          this.router.navigate(['/home']);
          
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

    submit(){
      
    }
  }
