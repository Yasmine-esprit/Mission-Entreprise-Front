import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './service/login.service';
import { UserService } from './service/user.service';
import { Tache } from './models/tache.model';
import { WebSocketService } from './service/web-socket.service';
import { UserDTO } from './models/user-dto';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent  implements OnInit{
  title = 'Mission-Entreprise';
  maTache: Tache | undefined;
  messages: any[] = [];
  isConnected = false;

  username: string = '';
  connectingMessage = 'Connecting...';

  
  constructor(  private authService : LoginService,
    private router: Router , private userService : UserService,
  private websocketService : WebSocketService){
    console.log('app constructor called')
  }



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
  this.userService.getCurrentUser().subscribe({
  next: (user: UserDTO) => {
    console.log('Logged‐in user:', user);
    // now user.idUser, user.nomUser, etc. are available
    this.connectedUserId   = user.idUser;
  
  },
  error: (error) => {
    console.error('Failed loading user:', error);
  }
});
}




}
