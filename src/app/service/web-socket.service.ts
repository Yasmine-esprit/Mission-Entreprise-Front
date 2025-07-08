import { Injectable } from '@angular/core';
import { Client, IMessage, StompSubscription, StompConfig, StompHeaders } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Subject } from 'rxjs';
import * as Stomp from 'stompjs';


export interface ChatMessage {
  contenu: string;
  dateEnvoi?: Date;
  lu?: boolean;
  groupeMsg: { idGrpMsg: number };
  userMessage: { idUser: number; username: string };
}

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
   private stompClient!: Stomp.Client;
  private messagesSubject =  new Subject<ChatMessage>();
  public messages$ = this.messagesSubject.asObservable();

  connect(groupId: number): void {
    const socket = new SockJS('http://localhost:8081/ws');
    this.stompClient = Stomp.over(socket);

    const token = localStorage.getItem('jwtToken');
    if (!token) {
      console.error('No JWT token found');
      return;
    }

    const headers: StompHeaders = {
      'Authorization': `Bearer ${token}`
    };


    this.stompClient.connect({}, () => {
      console.log('✅ STOMP connecté');

      this.stompClient.subscribe(`/topic/group/${groupId}`, (message) => {
         const msg: ChatMessage = JSON.parse(message.body);
        console.log('📩 Message reçu:', msg);
        this.messagesSubject.next(msg);
      });
    }, (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  sendMessage(msg: ChatMessage): void {
    this.stompClient.send('/app/chat.sendMessage', {}, JSON.stringify(msg));
  }

  disconnect(): void {
    if (this.stompClient) {
      this.stompClient.disconnect(() => console.log('🛑 Déconnecté'));
    }
  }
}
