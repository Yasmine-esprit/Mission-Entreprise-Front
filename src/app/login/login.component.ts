import { Component } from '@angular/core';
import { LoginService } from '../service/login.service';
import { AuthenticationRequest } from '../models/authentication-request';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  is2FAVerificationNeeded = false;
  twoFACode = '';  // Store the 2FA code entered by the user

  constructor(private authService: LoginService,
    private router: Router,   private userService: UserService ) {}

 onLogin(): void {
    const request: AuthenticationRequest = {
    email: this.email,
    password: this.password
  };
    console.log(request);

  this.authService.login(request).subscribe({
    next: (response: any) => {
      console.log((response.token));
      if (response.token) {
        this.authService.storeToken(response.token);
        console.log('Login successful');
        this.errorMessage = '';

        // ✅ Get and store the connected user
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            this.userService.setCurrentUser(user); // ✅ Notify other components
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Failed to load user after login', err);
            this.router.navigate(['/home']); // Still navigate even if user fails
          }
        });

      } else if (response.message) {
        this.is2FAVerificationNeeded = true;
        this.errorMessage = response.message;
      }
    },
    error: (err: HttpErrorResponse) => {
      console.log(err);
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


  // Verify the 2FA code entered by the user
 onVerify2FACode(): void {
  if (!this.twoFACode) {
    this.errorMessage = 'Please enter the 2FA code.';
    return;
  }
  const verificationData = {
    email: this.email,
    code: this.twoFACode
  };

  this.authService.verify2FA(verificationData).subscribe({
    next: (response: any) => {
      if (response.token) {
        this.authService.storeToken(response.token);
        console.log('2FA Verification successful');

        // ✅ Get and store the connected user
        this.userService.getCurrentUser().subscribe({
          next: (user) => {
            this.userService.setCurrentUser(user); // ✅ Notify navbar
            this.router.navigate(['/home']);
          },
          error: (err) => {
            console.error('Failed to load user after 2FA', err);
            this.router.navigate(['/home']);
          }
        });

      } else {
        this.errorMessage = 'Invalid 2FA code. Please try again.';
      }
    },
    error: (err: HttpErrorResponse) => {
      console.error(err);
      this.errorMessage = 'An error occurred during 2FA verification.';
    }
  });
}

}
