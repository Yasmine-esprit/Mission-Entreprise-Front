import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
              private userService : UserService
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
      }
    )
    
  }

  onUpdate(){
    

  }

}
