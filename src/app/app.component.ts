import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './service/login.service';
import { UserService } from './service/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit{
  title = 'Mission-Entreprise';

  constructor(  private authService : LoginService,
              private router: Router , private userService : UserService){}
  


              connectedUserId : any;
  ngOnInit(): void {
    this.connectedUser()
  }

  onLogout(): void {
    this.authService.logout();
    console.log('User logged out');
    this.router.navigate(['/login']); // or wherever you want to redirect
  }
  get isUserLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  
  connectedUser() {
    this.userService.getCurrentUser().subscribe(
      (response) => {
        console.log(response);
        if (response && response.idUser !== undefined) {
          this.connectedUserId = response;
          console.log('connectedUser:', this.connectedUserId);
        } else {
          console.error('idUser is undefined');
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }
  
}
