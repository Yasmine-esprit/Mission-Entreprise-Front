import { Component, OnInit } from '@angular/core';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  users: any[] = []; 
  constructor(private userService: UserService) {}

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
      },
      error=>{
        console.log(error)
      }
    )

  }
}
