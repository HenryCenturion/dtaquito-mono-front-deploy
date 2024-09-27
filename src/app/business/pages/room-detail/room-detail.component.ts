import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Room} from "../../models/room.model";
import {ActivatedRoute} from "@angular/router";
import {RoomService} from "../../services/room.service";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {UserService} from "../../services/user.service";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {format, toZonedTime} from "date-fns-tz";

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    MatCardHeader,
    MatCard,
    NgIf,
    MatCardContent,
    MatCardImage,
    MatCardTitle,
    MatCardSubtitle,
    NgForOf,
    MatFormField,
    MatInput,
    FormsModule,
    MatButton,
    MatIcon,
    NgClass
  ],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.css'
})
export class RoomDetailComponent implements OnInit {
  @ViewChild('lastMessage') lastMessage: ElementRef | undefined;

  room: Room | undefined;
  players: any[] = [];
  messages: any[] = [];
  newMessage: string = '';
  userData: any;

  constructor(
    private route: ActivatedRoute,
    private roomService: RoomService,
    private userService: UserService
  ) {}

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    if (this.lastMessage) {
      this.lastMessage.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }
  }


  ngOnInit(): void {
    this.getUser();
    this.getRoomDetails();
    this.getPlayerList();
    this.getRoomChat();
  }

  getUser(): void {
    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (data: any) => {
          this.userData = data;
        }
      );
    }
  }

  private getUserIdFromLocalStorage(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId');
    }
    return null;
  }

  getRoomDetails(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.roomService.getRoomById(+roomId).subscribe(
        (data: Room) => {
          this.room = data;
          this.setMaxPlayers(this.room);
        }
      );
    }
  }

  getRoomChat(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.roomService.getRoomChat(+roomId).subscribe(
        (data: any[]) => {
          data.forEach(message => {
            message.createdAt = new Date(message.createdAt);
          });
          data.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
          this.messages = [];
          data.forEach(message => {
            this.userService.getUserById(message.userId).subscribe(
              (user: any) => {
                this.messages.push({
                  content: message.content,
                  user: user,
                  createdAt: message.createdAt
                });
                this.messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
              }
            );
          });
        }
      );
    }
  }


  getPlayerList(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId) {
      this.roomService.getPlayerList(+roomId).subscribe(
        (playerIds: any[]) => {
          this.players = [];
          playerIds.forEach(player => {
            const playerId = player.userId;
            this.userService.getUserById(playerId).subscribe(
              (user: any) => {
                this.players.push(user);
              }
            );
          });
        }
      );
    }
  }
  getSportName(sportId: number): string {
    switch (sportId) {
      case 1:
        return 'Futbol';
      case 2:
        return 'Billar';
      default:
        return 'Unknown Sport';
    }
  }

  getSportGamemode(gamemode: string): string {
    switch (gamemode) {
      case "FUTBOL_5":
        return 'Futbol 5';
      case "FUTBOL_7":
        return 'Futbol 7';
      case "FUTBOL_8":
        return 'Futbol 8';
      case "FUTBOL_11":
        return 'Futbol 11';
      case "BILLAR_3":
        return 'Billar';
      default:
        return 'Unknown Gamemode';
    }
  }

  setMaxPlayers(room: Room): number {
    switch (room.sportSpace.gamemode) {
      case "FUTBOL_5":
        return room.maxPlayers = 10;
      case "FUTBOL_7":
        return room.maxPlayers = 14;
      case "FUTBOL_8":
        return room.maxPlayers = 16;
      case "FUTBOL_11":
        return room.maxPlayers = 22;
      case "BILLAR_3":
        return room.maxPlayers = 3;
      default:
        return 0;
    }
  }

  formatDate1(dateString: string): string {
    const timeZone = 'Etc/GMT-0';
    const zonedDate = toZonedTime(new Date(dateString), timeZone);
    return format(zonedDate, 'dd/MM/yyyy, HH:mm:ss', { timeZone });
  }

  formatDate2(dateString: string): string {
    const timeZone = 'Etc/GMT+10';
    const zonedDate = toZonedTime(new Date(dateString), timeZone);
    return format(zonedDate, 'dd/MM/yyyy, HH:mm:ss', { timeZone });
  }

  sendMessage(): void {
    const roomId = this.route.snapshot.paramMap.get('id');
    if (roomId && this.newMessage.trim() && this.userData) {
      this.roomService.sendMessage(+roomId, this.newMessage, this.userData.id).subscribe(
        (response: any) => {
          this.messages.push({
            content: response.content,
            user: this.userData,
            createdAt: new Date(response.createdAt)
          });
          this.newMessage = '';
        },
        (error: any) => {
          console.error('Error sending message', error);
        }
      );
    }
  }
}
