import {Component, OnInit} from '@angular/core';
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {Room} from "../../models/room.model";
import {RoomService} from "../../services/room.service";
import {
  MatCard, MatCardActions,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardSubtitle,
  MatCardTitle
} from "@angular/material/card";
import {MatButton} from "@angular/material/button";
import {UserService} from "../../services/user.service";
import {Router} from "@angular/router";
import {ConfirmJoinRoomDialogComponent} from "../../components/confirm-join-room-dialog/confirm-join-room-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {ErrorJoinRoomDialogComponent} from "../../components/error-join-room-dialog/error-join-room-dialog.component";
import { format, toZonedTime } from 'date-fns-tz';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {CreateRoomDialogComponent} from "../../components/create-room-dialog/create-room-dialog.component";


@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    MatGridList,
    MatGridTile,
    NgForOf,
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatCardImage,
    MatCardSubtitle,
    MatCardActions,
    MatButton,
    NgIf,
    MatFormField,
    MatSelect,
    MatOption,
    FormsModule,
    MatInput,
    MatLabel,
    NgClass
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.css'
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  userData: any | undefined;
  filteredRooms: Room[] = [];

  filter = {
    sportId: null,
    gamemode: '',
    district: '',
    minAmount: 0,
    maxAmount: 0
  };

  sports = [
    { id: 1, name: 'FUTBOL' },
    { id: 2, name: 'BILLAR' }
  ];
  districts = [
    'Ancón', 'Ate', 'Barranco', 'Breña', 'Carabayllo', 'Chaclacayo', 'Chorrillos', 'Cieneguilla', 'Comas', 'El Agustino',
    'Independencia', 'Jesús María', 'La Molina', 'La Victoria', 'Lima', 'Lince', 'Los Olivos', 'Lurigancho', 'Lurín',
    'Magdalena del Mar', 'Miraflores', 'Pachacámac', 'Pucusana', 'Pueblo Libre', 'Puente Piedra', 'Punta Hermosa',
    'Punta Negra', 'Rímac', 'San Bartolo', 'San Borja', 'San Isidro', 'San Juan de Lurigancho', 'San Juan de Miraflores',
    'San Luis', 'San Martín de Porres', 'San Miguel', 'Santa Anita', 'Santa María del Mar', 'Santa Rosa', 'Santiago de Surco',
    'Surquillo', 'Villa El Salvador', 'Villa María del Triunfo'
  ];
  gamemodes: string[] = [];

  constructor(
    private roomService: RoomService,
    private userService: UserService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getUser();
    this.getAllRooms();
    this.updateGamemodes();
  }

  getAllRooms(): void {
    this.roomService.getAllRooms().subscribe(
      (data: any) => {
        this.rooms = data;
        this.rooms.forEach(room => {
          this.getPlayerList(room.id);
          this.setMaxPlayers(room);
        });
        this.applyFilters();
      },
      (error: any) => {
        console.error('Error fetching rooms', error);
      }
    );
  }

  applyFilters(): void {
    this.filteredRooms = this.rooms.filter(room => {
      return (!this.filter.sportId || room.sportSpace.sportId === this.filter.sportId) &&
        (!this.filter.gamemode || room.sportSpace.gamemode === this.filter.gamemode) &&
        (!this.filter.district || room.sportSpace.district === this.filter.district) &&
        (!this.filter.minAmount || room.sportSpace.amount >= this.filter.minAmount) &&
        (!this.filter.maxAmount || room.sportSpace.amount <= this.filter.maxAmount);
    });
  }

  clearFilters(): void {
    this.filter = {
      sportId: null,
      gamemode: '',
      district: '',
      minAmount: 0,
      maxAmount: 0
    };
    this.applyFilters();
  }

  getPlayerList(roomId: number): void {
    this.roomService.getPlayerList(roomId).subscribe(
      (playerList: any[]) => {
        const room = this.rooms.find(r => r.id === roomId);
        if (room) {
          room.isUserInRoom = this.isUserInRoom(playerList);
          room.playerLists = playerList;
        }
      },
      (error: any) => {
        console.error('Error fetching player list', error);
      }
    );
  }

  private getUserIdFromLocalStorage(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId');
    }
    return null;
  }

  isUserInRoom(playerList: any[]): boolean {
    return playerList.some(player => player.userId === this.userData.id);
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

  getMaxPlayers(room: Room): number {
    switch (room.sportSpace.gamemode) {
      case "FUTBOL_5":
        return 10;
      case "FUTBOL_7":
        return 14;
      case "FUTBOL_8":
        return 16;
      case "FUTBOL_11":
        return 22;
      case "BILLAR_3":
        return 3;
      default:
        return 0;
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

  joinRoom(roomId: number, amount: number): void {
    if (this.userData && this.userData.credits < amount) {
      this.dialog.open(ErrorJoinRoomDialogComponent, {
        width: '250px'
      });
      return;
    }

    const dialogRef = this.dialog.open(ConfirmJoinRoomDialogComponent, {
      width: '250px',
      data: { amount }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.userData && this.userData.id) {
          this.roomService.joinPlayerList(this.userData.id, roomId).subscribe(
            (response: any) => {
              if (response.message === "Player added to room and chat successfully") {
                this.viewRoom(roomId);
              }
            },
            (error: any) => {
              console.error('Error joining room', error);
            }
          );
        }
      }
    });
  }

  viewRoom(roomId: number): void {
    this.router.navigate(['/room-detail', roomId]);
  }

  formatDate(dateString: string): string {
    const timeZone = 'Etc/GMT-0';
    const zonedDate = toZonedTime(new Date(dateString), timeZone);
    return format(zonedDate, 'dd/MM/yyyy, HH:mm:ss', { timeZone });
  }

  getRemainingPlayers(room: Room): number {
    return this.getMaxPlayers(room)- room.playerLists.length;
  }

  updateGamemodes(): void {
    if (this.filter.sportId === 1) {
      this.gamemodes = ['FUTBOL_11', 'FUTBOL_8', 'FUTBOL_7', 'FUTBOL_5'];
    } else if (this.filter.sportId === 2) {
      this.gamemodes = ['BILLAR_3'];
    } else {
      this.gamemodes = [];
    }
  }

  openCreateRoomDialog(): void {
    const dialogRef = this.dialog.open(CreateRoomDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllRooms();
      }
    });
  }

}
