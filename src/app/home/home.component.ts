import { Component, OnInit } from '@angular/core';
import { RegisterService } from '../service/register.service';

import { HttpErrorResponse } from '@angular/common/http';
import { LoginService } from '../service/login.service';
import { Router } from '@angular/router';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit  {
  role: string | null = null;
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
            
           
    


}
