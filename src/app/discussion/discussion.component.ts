import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { DiscussionService } from '../service/discussion.service';
import { MessageService } from '../service/message.service';
import { UserService } from '../service/user.service';
import { Subscription } from 'rxjs';


import * as SockJS from 'sockjs-client';
import * as Stomp from 'stompjs';
import { WebSocketService } from '../service/web-socket.service';


@Component({
  selector: 'app-discussion',
  templateUrl: './discussion.component.html',
  styleUrls: ['./discussion.component.css']
})
export class DiscussionComponent implements OnInit{

  constructor(
    private discussionService: DiscussionService,
    private messageService: MessageService,
    private userService: UserService,
    private webSocketService : WebSocketService,
     private cdr: ChangeDetectorRef 
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
  memberGroup : any [] = []


  sub!: Subscription;
connectedUsername: string = '';
userId : number = 0;
 

  ngOnInit(): void {
       this.connectedUser();
    this.loadGroupes();

 
   

  }




getUserById(id: number) {
  
  const user = this.users.find(user => {
   
    return user.idUser === id;
  });
  
  return user;
}

  

   connectedUser() {
    this.userService.getCurrentUser().subscribe({
      next: (responseText) => {
        
       
        this.connectedUserId = responseText
        console.log("connected user in conneted user function " ,this.connectedUserId)

        this.userId = responseText.idUser;
this.connectedUsername = responseText.nomUser + ' ' + responseText.prenomUser;


         // Maintenant que connectedUserId est chargé, on peut charger les utilisateurs
      this.loadUsers();
        
        
      },
      error: (error) => {
        console.error('Erreur HTTP:', error);
      }
    });
    
    
  }
  hasGroupMembers(groupId: number): boolean {
  return Array.isArray(this.selectedUsersByGroup[groupId]) && this.selectedUsersByGroup[groupId].length > 0;
}

  
  loadGroupes() {
  this.discussionService.getGroupes().subscribe({
    next: (groupes) => {
      this.data = groupes;
      console.log('Groupes:', this.data);

      // Charger les membres pour chaque groupe
      this.data.forEach(group => {
        this.userService.getUsersGroupId(group.idGrpMsg).subscribe({
          next: (members) => {
            console.log(members)
            // On filtre seulement les objets utilisateurs (éliminer les ids numériques éventuels)
            this.selectedUsersByGroup[group.idGrpMsg] = members.filter((u: any) => typeof u === 'object' && u.idUser);
          },
          error: (err) => {
            console.error('Erreur lors du chargement des membres du groupe', err);
          }
        });
      });
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
        const id = this.connectedUserId.idUser
        console.log("id connected user ", id)
        this.users = response.filter(user => user.idUser !== id);
        console.log('Utilisateurs disponibles :', this.users);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
      }
    });
  }

  selectGroup(group: any): void {
      console.log(" select group ", group)
    this.selectedGroup = group;
    // 1. Charger les anciens messages du groupe
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


    // 2. Connexion WebSocket au bon groupe
  this.webSocketService.connect(group.idGrpMsg);

  // 3. Écoute des messages en temps réel
this.sub = this.webSocketService.messages$.subscribe((newMsg: any) => {
  console.log('🟡 Message reçu dans subscribe :', JSON.stringify(newMsg, null, 2));
  if (newMsg && newMsg.groupId === this.selectedGroup.idGrpMsg) {
    this.messages = [...this.messages, newMsg];
    this.cdr.detectChanges();
    console.log('➡️ Message ajouté: ', newMsg);
   console.log(this.messages)
  } else {
    console.log('❌ Message ignoré (groupe ne correspond pas ou newMsg invalide)');
    console.log('Group dans newMsg:', newMsg.groupeMsg?.idGrpMsg);
    console.log('Groupe sélectionné:', this.selectedGroup?.idGrpMsg);
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
  
sendMessage(): void {
  if (!this.selectedGroup || !this.messageContent.trim()) {
    return;
  }

  const messagePayload = {
    contenu: this.messageContent,
    groupeMsg: { idGrpMsg: this.selectedGroup.idGrpMsg },
    userMessage: { idUser: this.userId,  username: this.connectedUsername }
  };

  this.webSocketService.sendMessage(messagePayload);
  this.messageContent = ''; // Réinitialiser la zone de texte
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
