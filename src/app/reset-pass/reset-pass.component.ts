import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrls: ['./reset-pass.component.css']
})
export class ResetPassComponent {
  token: any;
  newPassword: string = '';
  confirmPassword: string = '';

  successMessage: string = '';
  errorMessage: string = '';
  constructor(
    private route: ActivatedRoute,    // To access route query parameters
    private fb: FormBuilder,
    private authService: LoginService,
    private router: Router
  ) {
    // Get the token from the URL
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      console.log("Token from query param:", this.token);
    });
    
    console.log("tokeni" , this.token)
  }

  resetPassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = "Passwords do not match";
      return;
    }
    console.log("new pass is " , this.newPassword)
    
    
    this.authService.resetPassword( this.token ,  this.newPassword).subscribe(
      (response: any) => {
        this.successMessage = response.message; 
        // Redirect user to login page after success
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      (error) => {
        this.errorMessage = "There was an error resetting your password. Please try again.";
      }
    )



}
}
