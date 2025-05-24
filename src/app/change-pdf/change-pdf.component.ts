import { Component, ElementRef, ViewChild } from '@angular/core';
import { UserService } from '../service/user.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-change-pdf',
  templateUrl: './change-pdf.component.html',
  styleUrls: ['./change-pdf.component.css']
})
export class ChangePDFComponent {
    selectedFile: File | null = null;
  
  photoUrl: string | null = null;
userId : any;
  constructor(private userService: UserService , private router : Router) {}

  ngOnInit(): void {
    this.loadPhoto();
    this.connectedUser()
  }
   connectedUser() {
    this.userService.getCurrentUser().subscribe({
      next: (responseText) => {
        
       
        this.userId = responseText.idUser
        console.log("connected user in conneted user function " ,this.userId)

       


      
      },
      error: (error) => {
        console.error('Erreur HTTP:', error);
      }
    });
    
    
  }
onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];

  if (this.selectedFile) {
    // Affiche un aperçu local sans l’envoyer au serveur
    const reader = new FileReader();
    reader.onload = () => {
      this.photoUrl = reader.result as string;
    };
    reader.readAsDataURL(this.selectedFile);
  }
}


  uploadPhoto() {
    if (this.selectedFile) {
      this.userService.uploadPhoto(this.userId, this.selectedFile).subscribe(
        (response) => {
          console.log(response)
          this.userService.refreshUser();
          this.router.navigate(['/home'])
      },(error)=>{
        console.log(error)
      }
    );
    }
  }

  loadPhoto() {
    this.userService.getUserPhoto(this.userId).subscribe(blob => {
      this.photoUrl = URL.createObjectURL(blob);
    });
  }
}