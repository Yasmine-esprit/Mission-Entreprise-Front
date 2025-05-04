import { Component } from '@angular/core';
import { RegisterService } from '../service/register.service';
import { RegistrationRequest } from '../models/registration-request';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  photoProfil: File | null = null;  // Changed to File type
  message = '';
  error = '';
  errorMessage = '';

  constructor(private authService: RegisterService) {}

  // Registration method
  onRegister(): void {
    // Ensure all required fields are filled out
    if (!this.firstname || !this.lastname || !this.email || !this.password || !this.photoProfil) {
      this.error = 'All fields, including photo, are required!';
      return;
    }

    
    const formData = new FormData();
  formData.append('firstname', this.firstname);
  formData.append('lastname', this.lastname);
  formData.append('email', this.email);
  formData.append('password', this.password);
  formData.append('role', 'ETUDIANT')

  if (this.photoProfil instanceof Blob) {
    // If it's a Blob, assume it has a name or give it a default one
    formData.append('photoProfil', this.photoProfil, (this.photoProfil as any).name || 'profile.jpg');
  }

  // Log FormData manually
  formData.forEach((value, key) => {
    console.log(`${key}:`, value);
  });
    
  this.authService.register(formData).subscribe({
    next: (response: any) => {
      this.message = response; 
      console.log('Success:', response);
      this.errorMessage = '';
    },
    error: (error: HttpErrorResponse) => {
      if (typeof error.error === 'string') {
        // Backend returned a plain text error like "User already exists"
        this.errorMessage = error.error;
      } else if (error.error?.message) {
        this.errorMessage = error.error.message;
      } else {
        this.errorMessage = 'An unknown error occurred.';
      }
      console.error('Error:', this.errorMessage);
    }
  });
  
  }

  // File selection handler
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    
    if (file) {
      // Ensure the file is of a valid type (e.g., image)
      if (file.type.startsWith('image/')) {
        this.photoProfil = file;  // Store the file object
      } else {
        this.error = 'Please upload a valid image file.';
      }
    }
  }
}
