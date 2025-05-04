import { Component } from '@angular/core';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-forget-pass',
  templateUrl: './forget-pass.component.html',
  styleUrls: ['./forget-pass.component.css']
})
export class ForgetPassComponent {
  email: string = '';
  message: string = ''; // To show success/error message
  errorMessage: string = ''; // To show error message

  constructor(private forgotPasswordService: LoginService) {}

  submit() {
    
    const payload = {
      email: this.email
    };
    this.forgotPasswordService.sendResetLink(payload).subscribe(
      (response) => {
        console.log('Response:', response);
        this.message = 'Password reset link sent to your email!';
        this.errorMessage = '';
      },
      (error) => {
        console.log("err" , error)
        this.errorMessage = error.error.message || 'Error sending reset link';
        this.message = '';
      }
    );
  }

}
