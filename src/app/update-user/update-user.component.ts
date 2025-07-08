import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  userId: any;
  user: any = {};

  // Champs modifiables liés au formulaire
  firstname = '';
  lastname = '';
  email = '';
  password = '';
  confirmPassword = '';
  message = '';
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

ngOnInit(): void {
  this.userId = this.route.snapshot.params['id'];
  this.userService.getUserById(this.userId).subscribe(
    response => {
      this.user = response;
      this.firstname = this.user.prenomUser;
      this.lastname = this.user.nomUser;
      this.email = this.user.emailUser;
      // tu peux initialiser password / confirmPassword à '' par défaut
      this.password = '';
      this.confirmPassword = '';
    },
    error => {
      console.log(error);
      this.errorMessage = 'Failed to load user';
    }
  );
}




 onUpdate(): void {
  const updatedUser: any = {};

  if (this.firstname && this.firstname !== this.user.prenomUser) {

    updatedUser.prenomUser = this.firstname;
    
  }
  if (this.lastname && this.lastname !== this.user.nomUser) {
    updatedUser.nomUser = this.lastname;
  }
  if (this.email && this.email !== this.user.emailUser) {
    updatedUser.emailUser = this.email;
  }
   console.log('Updating user with:', updatedUser);
  // Le mot de passe n'existe pas dans UserDTO, à gérer à part si besoin

  if (Object.keys(updatedUser).length === 0) {
    this.message = 'No changes to update';
    this.errorMessage = '';
    return;
  }

 

  this.userService.UpdateUser(this.userId, updatedUser).subscribe({
    next: res => {
      this.message = 'User updated successfully';
      this.errorMessage = '';
      console.log(res);
    
    },
    error: err => {
      console.error(err);
      this.message = '';
      this.errorMessage = 'Update failed. Please try again.';
    }
  });
}

}
