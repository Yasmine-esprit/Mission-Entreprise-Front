import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';
import { LoginService } from '../service/login.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = []; 
  email : any;
  constructor(private userService: UserService,
    private loginService : LoginService
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(
      (response: any) => {
        this.users = response; 
        console.log(this.users);
      },
      error => {
        console.error('Error loading users:', error);
      }
    );
  }

  DeleteUser(id : any){
    this.userService.DeleteUser(id).subscribe(
      response=>{
        console.log(response)
        this.users = this.users.filter(user => user.idUser !== id);
      },
      error=>{
        console.log(error)
      }
    )

  }

  EnableUser (emailUti : any){
    console.log(" email is " , emailUti)
    this.loginService.enableUser(emailUti).subscribe({
      next: (res) => {
        console.log('User enabled successfully');
      },
      error: (err) => {
        console.error('Error enabling user:', err);
      }
    });
  }
}
