import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { UserService } from '../service/user.service';
import { UserDTO } from '../models/user-dto';
import { RegisterService } from '../service/register.service';
import { ProfileServiceService } from '../service/profile-service.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  menuOpen = false;
  connectedUserId : any;
  isMenuOpen = false;

role: string | null = null;
 profilePhoto: string ='';
 
    constructor(  private authService : LoginService,
    private router: Router , private userService : UserService , private registerService : RegisterService ,
    private photoService : ProfileServiceService){}
         


  ngOnInit(): void {
    this.connectedUser();
    this.role = this.authService.getUserRole();
              console.log('User role:', this.role);
              if (this.role?.includes("ETUDIANT")){
                console.log("say yes")
              }
  }

 



  goToDashboard(): void {
    this.router.navigate(['/kanban']);
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
 this.userService.getCurrentUser().subscribe({
  next: (user: UserDTO) => {
    console.log('Logged‐in user:', user);
    // now user.idUser, user.nomUser, etc. are available
    this.connectedUserId   = user;
    
  },
  error: (error) => {
    console.error('Failed loading user:', error);
  }
});


   
}

toggleMenu() {
  this.isMenuOpen = !this.isMenuOpen;
}


}
