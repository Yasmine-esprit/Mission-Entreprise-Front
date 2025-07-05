import { Component, OnDestroy, OnInit } from '@angular/core';
import { ChatMessage, WebSocketService } from '../service/web-socket.service';
import { UserService } from '../service/user.service';
import { Subscription } from 'rxjs'; // ✅ Correct

import { UserDTO } from '../models/user-dto';

@Component({
  selector: 'app-changepass',
  templateUrl: './changepass.component.html',
  styleUrls: ['./changepass.component.css']
})
export class ChangepassComponent {
}

