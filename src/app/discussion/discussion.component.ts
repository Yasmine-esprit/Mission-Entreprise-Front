import { Component, OnInit } from '@angular/core';
import { DiscussionService } from '../service/discussion.service';
import { MessageService } from '../service/message.service';
import { NgModule } from '@angular/core';
;

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css']
})
export class DiscussionComponent implements OnInit {


  constructor (private discussionService : DiscussionService,
                private messageService : MessageService
  ){}
  data: any[] = [];
  messages: any[] = [];
  selectedGroup: any = null;


  ngOnInit(): void {
    this.discussionService.getGroupes().subscribe(
      response=>{
        this.data =  response
        console.log(this.data)
      },
      error =>{
        console.log("error fetching ", error)
      }
    )
    
  }
  selectGroup(group: any): void {
    this.selectedGroup = group;
    this.messageService.getMessagesByGroupId(this.selectedGroup.idGrpMsg).subscribe(
      response=>{
        this.messages = response
        console.log(this.messages)
       
      },
      error=>{
        console.log(error)
      }
    )
  }
  deleteGroup(groupId: number) {
    this.discussionService.deleteGroup(groupId).subscribe((
      response) => {
        this.data = this.data.filter(group => group.idGrpMsg !== groupId);
        console.log('Group deleted successfully');
      },
      (error) => {
        console.error('Error deleting group:', error);
      }
    )
    
    }

  

}
