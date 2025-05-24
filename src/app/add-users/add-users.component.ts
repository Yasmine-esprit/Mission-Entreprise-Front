import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { RegisterService } from '../service/register.service';
import { UserService } from '../service/user.service';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.css']
})
export class AddUsersComponent {

 excelData: any[] = [];
 mappedData: { firstname: string; lastname: string; role: string; email: string; password: string; photoProfil: any }[] = [];
 role: string | null = null;
 errorMessage : any;
 successMessage : any;

 constructor(private registerService : RegisterService ,
             private authService : LoginService,
             private router: Router,
           private userService : UserService){}
 ngOnInit(): void {
   this.role = this.authService.getUserRole();
               console.log('User role:', this.role);
               if (this.role?.includes("ETUDIANT")){
                 console.log("say yes")
               }
 
              
             }
             
            
     
 generateRandomPassword(length: number = 10): string {
   const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
   let password = '';
   for (let i = 0; i < length; i++) {
     password += chars.charAt(Math.floor(Math.random() * chars.length));
   }
   return password;
 }
 
 onExcelUpload(event: any): void {
   const file = event.target.files[0];
   if (!file) return;
 
   const reader = new FileReader();
   reader.onload = (e: any) => {
     const data = new Uint8Array(e.target.result);
     const workbook = XLSX.read(data, { type: 'array' });
 
     const sheetName = workbook.SheetNames[0]; // Read the first sheet
     const sheet = workbook.Sheets[sheetName];
 
     // Convert to JSON
     this.excelData = XLSX.utils.sheet_to_json(sheet);
     console.log(this.excelData); // Logs the parsed Excel data
     this.mappedData = this.excelData.map((row: any) => ({
       firstname: row['Nom'],
       lastname: row['Prenom'],
       role: row['role'],
       email: `${row['Nom']}${row['Prenom']}@esprit.com`.toLowerCase().replace(/\s+/g, ''),
       password: this.generateRandomPassword(),
       photoProfil: '' 
       
     }));
     
     console.log(this.mappedData)
     // Step 1: Map the data
 this.mappedData = this.excelData.map((row: any) => ({
   firstname: row['Nom'],
   lastname: row['Prenom'],
   role: row['role'],
   email: `${row['Nom']}${row['Prenom']}@esprit.com`.toLowerCase().replace(/\s+/g, ''),
   password: this.generateRandomPassword(),
   photoProfil: ''
 }));
 
 // Step 2: Register each user
 fetch('assets/defaultimage.jpg')
       .then(res => res.blob())
       .then(defaultImageBlob => {
         this.mappedData.forEach((user) => {
           const form = new FormData();
           form.append('firstname', user.firstname);
           form.append('lastname', user.lastname);
           form.append('role', user.role);
           form.append('email', user.email);
           form.append('password', user.password);
           form.append('photoProfil', defaultImageBlob, 'defaultimage.jpg'); 
 
           this.registerService.register(form).subscribe({
             next: (response: any) => {
              console.log('User registered:', response)
              this.successMessage = response
              this.errorMessage= ''
            },
             error: (error: HttpErrorResponse) => {
               let errorMsg = 'An unknown error occurred.';
               if (typeof error.error === 'string') errorMsg = error.error;
               else if (error.error?.message) errorMsg = error.error.message;
               console.error('Error registering user:', errorMsg);
               this.errorMessage = 'Error registering user:'
               this.successMessage= ''
             }
           });
         });
       });
   
 
   };
 
   reader.readAsArrayBuffer(file);
 }
 getKeys(obj: any): string[] {
   return Object.keys(obj);
 }
 
 

}
