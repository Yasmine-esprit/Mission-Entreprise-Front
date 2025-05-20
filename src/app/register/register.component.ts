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
  currentStep = 1;

  firstname = '';
  lastname = '';
  email = '';
  password = '';
  photoProfil: File | null = null;
  message = '';
  error = '';
  errorMessage = '';
  roles = ['ETUDIANT', 'ENSEIGNANT', 'COORDINATEUR'];
roleSelected = ''
  qrCodeUrl: SafeUrl | null = null;
  matricule: string = '';
niveau: string = '';
specialite: string = '';
dateNaissance: string = ''; // Will bind to string in yyyy-MM-dd format from <input type="date">
grade: string = '';
domaineRecherche: string = '';
bureau: string = '';
departement: string = '';
anneeExperience: any ;


  constructor(
    private authService: RegisterService,
    private sanitizer: DomSanitizer
  ) {}

  onRegister(): void {
    if (!this.firstname || !this.lastname || !this.email || !this.password ) {
      this.error = 'All fields, including photo, are required!';
      return;
    }
    if (!this.roleSelected) {
      this.errorMessage = "Please select a role";
      return;
    }
  

    const formData = new FormData();
    formData.append('firstname', this.firstname);
    formData.append('lastname', this.lastname);
    formData.append('email', this.email);
    formData.append('password', this.password);
    formData.append('role', this.roleSelected);

    console.log("role " , this.roleSelected)
    if (this.roleSelected === 'ETUDIANT') {
      console.log('Etudiant selected!');
      formData.append('matricule',this.matricule);
      formData.append('niveau',this.niveau);
      formData.append('specialite',this.specialite);
      formData.append('dateNaissance',this.dateNaissance)
    }
    else if (this.roleSelected === 'ENSEIGNANT'){
      formData.append('grade',this.grade);
      formData.append('demainRecherche',this.domaineRecherche)
      formData.append('Bureau',this.bureau)
    }
    else {
      formData.append('departement',this.departement)
      formData.append('anneeExperience',this.anneeExperience)
    }


    if (this.photoProfil instanceof Blob) {
      formData.append('photoProfil', this.photoProfil, this.photoProfil.name || 'profile.jpg');
    }

    this.authService.register(formData).subscribe({
      next: (response: any) => {
        this.message = response.message || 'User registered successfully';
        this.errorMessage = '';
        console.log(response)
    const base64Match = response.match(/([A-Za-z0-9+/=]{100,})$/); // Match long base64 string
    if (base64Match && base64Match[1]) {
      this.qrCodeUrl = this.sanitizer.bypassSecurityTrustUrl(
        'data:image/png;base64,' + base64Match[1]
      );

    } else {
      console.warn('No base64 image found in response');
    }
     // Reset form data
  this.firstname = '';
  this.lastname = '';
  this.email = '';
  this.password = '';
  this.roleSelected = '';
  this.matricule = '';
  this.niveau = '';
  this.specialite = '';
  this.dateNaissance = '';
  this.grade = '';
  this.domaineRecherche = '';
  this.bureau = '';
  this.departement = '';
  this.anneeExperience = '';
  this.photoProfil = null;
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

  goNextStep() {
    if (this.roleSelected) {
      this.currentStep = 2;
    } else {
      alert('Please select a role before continuing');
    }
    
  }
  goPreviousStep() {
    this.currentStep = 1;
  }
}
