import { Component } from '@angular/core';
import { RegisterService } from '../service/register.service';
import { HttpErrorResponse } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  photoProfil: File | null = null;
  message = '';
  error = '';
  errorMessage = '';

  qrCodeUrl: SafeUrl | null = null;

  constructor(
    private authService: RegisterService,
    private sanitizer: DomSanitizer
  ) {}

  onRegister(): void {
    if (!this.firstname || !this.lastname || !this.email || !this.password || !this.photoProfil) {
      this.error = 'All fields, including photo, are required!';
      return;
    }

    const formData = new FormData();
    formData.append('firstname', this.firstname);
    formData.append('lastname', this.lastname);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('role', 'ETUDIANT');

    if (this.photoProfil instanceof Blob) {
      formData.append('photoProfil', this.photoProfil, this.photoProfil.name || 'profile.jpg');
    }

    this.authService.register(formData).subscribe({
      next: (response: any) => {
        this.message = response.message || 'User registered successfully';
        this.errorMessage = '';
        console.log(response)
         // Extract base64 part from the plain string
    const base64Match = response.match(/([A-Za-z0-9+/=]{100,})$/); // Match long base64 string
    if (base64Match && base64Match[1]) {
      this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(
        'data:image/png;base64,' + base64Match[1]
      );
    } else {
      console.warn('No base64 image found in response');
    }
      },
      error: (error: HttpErrorResponse) => {
        if (typeof error.error === 'string') {
          this.errorMessage = error.error;
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else {
          this.errorMessage = 'An unknown error occurred.';
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      this.photoProfil = file;
    } else {
      this.error = 'Please upload a valid image file.';
    }
  }
}
