import { Component, OnInit } from '@angular/core';
import { DiscussionService } from '../service/discussion.service';
import { MessageService } from '../service/message.service';
import { UserService } from '../service/user.service';

@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css']
})
export class DiscussionComponent implements OnInit {

  constructor(
    private discussionService: DiscussionService,
    private messageService: MessageService,
    private userService: UserService
  ) {}

  data: any[] = [];               // Liste des groupes
  messages: any[] = [];           // Messages du groupe sélectionné
  selectedGroup: any = null;      // Groupe sélectionné
  users: any[] = [];              // Utilisateurs disponibles
  showPopup: boolean = false;     // Affichage de la popup
  selectedUserIds: any[] = []; // Utilisateurs sélectionnés
  messageContent: string = '';
  connectedUserId : any;
  selectedUsersProfiles: any[] = [];
  selectedUsersByGroup: { [groupId: number]: any[] } = {};

  getUserById(id: number) {
    return this.users.find(user => user.idUser === id);
  }
  
  ngOnInit(): void {
    this.loadGroupes();
    this.loadUsers();
    this.connectedUser();
  }
  connectedUser(){
    this.userService.getCurrentUser().subscribe(
      (response)=>{
        
       
        console.log(response)
        if (response && response.idUser !== undefined) {
          this.connectedUser = response.idUser;
          console.log('idUser:', this.connectedUser);
        } else {
          console.error('idUser is undefined');
        }
      },(error)=>{
        console.log(error)
      }
    )
  }
  loadGroupes() {
    this.discussionService.getGroupes().subscribe({
      next: (response) => {
        this.data = response;
        console.log('Groupes:', this.data);
      },
      error: (error) => {
        console.error("Erreur lors du chargement des groupes :", error);
      }
    });
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (response: any[]) => {
        // Exclure l'utilisateur connecté (optionnel, si le backend ne le fait pas déjà)
        const connectedUserId = Number(localStorage.getItem('idUser'));
        this.users = response.filter(user => user.idUser !== connectedUserId);
        console.log('Utilisateurs disponibles :', this.users);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  selectGroup(group: any): void {
    this.selectedGroup = group;
  
    this.messageService.getMessagesByGroupId(group.idGrpMsg).subscribe({
      next: (response) => {
        // Trier du plus ancien au plus récent par ID
        this.messages = response.sort((a: any, b: any) => a.idMsg - b.idMsg);

        console.log('Messages triés:', this.messages);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des messages:', error);
      }
    });
  }
  
  

  deleteGroup(groupId: number): void {
    this.discussionService.deleteGroup(groupId).subscribe({
      next: () => {
        this.data = this.data.filter(group => group.idGrpMsg !== groupId);
        console.log('Groupe supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du groupe:', error);
      }
    });
  }

  onUserCheckboxChange(event: Event, user: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;
  
    if (isChecked) {
      this.selectedUserIds.push(user);
    } else {
      this.selectedUserIds = this.selectedUserIds.filter(u => u.idUser !== user.idUser);
    }
  }
  

  confirmSelection(): void {
    const selectedUser = this.selectedUserIds.map(user => user.idUser);
  
    this.showPopup = false;
  
    this.discussionService.creerGroupe(selectedUser).subscribe({
      next: (response) => {
        console.log('Group created:', response);
  
        // Assume response has new group ID
        const newGroupId = response.idGrpMsg;
  
        // Save selected users profiles by group ID
        this.selectedUsersByGroup[newGroupId] = [...this.selectedUserIds];
  
        // Reset selection
        this.selectedUserIds = [];
  
        // Reload groups
        this.loadGroupes();
      },
      error: (error) => {
        console.error('Error creating group:', error);
      }
    });
  }
  
  

  EnvoyerMsg(): void {
    if (!this.selectedGroup) {
      console.error('Aucun groupe sélectionné');
      return;
    }
  
    if (!this.messageContent.trim()) {
      console.error('Le message est vide');
      return;
    }
  
    const groupId = this.selectedGroup.idGrpMsg;
  
  
    this.messageService.envoyerMessage(groupId, this.messageContent).subscribe({
      next: (response) => {
        console.log('Message envoyé avec succès:', response);
        this.messageContent = '';
        this.selectGroup(this.selectedGroup); // Recharger les messages
      },
      error: (error) => {
        console.error('Erreur lors de l\'envoi du message:', error);
      }
    });
  }

  toggleUserSelection(user: any) {
    const index = this.selectedUserIds.findIndex(u => Number(u.idUser) === Number(user.idUser));
    if (index > -1) {
      // Remove user from selection
      this.selectedUserIds.splice(index, 1);
    } else {
      // Add user to selection
      this.selectedUserIds.push(user);
    }
    // Create a new array to trigger Angular change detection
    this.selectedUserIds = [...this.selectedUserIds];
  }
  
  
  isUserSelected(user: any): boolean {
    return this.selectedUserIds.some(u => u.idUser === user.idUser);
  }
  
  
}
