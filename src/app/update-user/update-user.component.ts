import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-update-user',
  templateUrl: './update-user.component.html',
  styleUrls: ['./update-user.component.css']
})
export class UpdateUserComponent implements OnInit {
  userId : any;
  user : any;
  firstname = '';
  lastname = '';
  email = '';
  password = '';
 
  message = '';
  error = '';
  errorMessage = '';
  constructor(private route : ActivatedRoute,
              private userService : UserService,
               private router: Router
  ){}

  ngOnInit(): void {
    this.userId = this.route.snapshot.params['id']
    console.log(this.userId)
    this.userService.getUserById(this.userId).subscribe(
      response=>{
        this.user = response

      },
      error=>{
        console.log(error)
        this.errorMessage = 'Failed to load user';
      }
    )
    
  }

 onUpdate(): void {
    const updatedUser = {
      ...this.user,
      passwordUser: this.password // if password is handled separately
    };

    console.log(updatedUser)
    this.userService.UpdateUser(this.userId, updatedUser).subscribe({
      next: (res) => {
        this.message = 'User updated successfully';
        this.errorMessage = '';
        console.log(res);
        // Optional redirect
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 1000);
      },
      error: (err) => {
        console.error(err);
        this.message = '';
        this.errorMessage = 'Update failed. Please try again.';
      }
    });
  }

}
