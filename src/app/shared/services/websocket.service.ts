import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private client: Client;
  private messageSubject: Subject<any> = new Subject<any>();

  constructor() {
    this.client = new Client({
      brokerURL: 'ws://dtaquito-backend.azurewebsites.net/ws/chat',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      webSocketFactory: () => new SockJS('ws://dtaquito-backend.azurewebsites.net/ws/chat')
    });

    this.client.onConnect = () => {
      this.client.subscribe('/topic/messages', (message: Message) => {
        this.messageSubject.next(JSON.parse(message.body));
      });
    };

    this.client.activate();
  }

  getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  sendMessage(roomId: number, content: string, userId: number): void {
    const message = { roomId, content, userId };
    this.client.publish({ destination: '/app/chat', body: JSON.stringify(message) });
  }
}
