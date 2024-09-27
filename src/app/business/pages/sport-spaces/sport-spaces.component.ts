import {Component, OnInit} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardImage,
  MatCardModule,
  MatCardTitle
} from "@angular/material/card";
import {SportSpace} from "../../models/sport-space.model";
import {SportSpaceService} from "../../services/sport-space.service";
import {MatButtonModule} from "@angular/material/button";
import {UserService} from "../../services/user.service";
import {SubscriptionService} from "../../services/subscription.service";
import {MatDialog} from "@angular/material/dialog";
import {AddSportSpacesDialogComponent} from "../../components/add-sport-spaces-dialog/add-sport-spaces-dialog.component";
import {MatIcon} from "@angular/material/icon";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import confetti from 'canvas-confetti';



@Component({
  selector: 'app-sport-spaces',
  standalone: true,
  imports: [
    NgForOf,
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatCardImage,
    NgOptimizedImage,
    MatCardModule,
    MatButtonModule,
    NgIf,
    MatIcon,
    MatFormField,
    MatSelect,
    FormsModule,
    MatOption,
    MatInput,
    MatLabel
  ],
  templateUrl: './sport-spaces.component.html',
  styleUrl: './sport-spaces.component.css'
})
export class SportSpacesComponent implements OnInit {
  sportSpaces: SportSpace[] = [];
  filteredSportSpaces: SportSpace[] = [];
  userData: any;
  userSubscriptionData: any;
  dataOwner = false;
  canAddMoreSportSpaces = false;
  maxSportSpaces = 0;
  filter = {
    sportId: null,
    gamemode: '',
    district: '',
    minPrice: 0,
    maxPrice: 0
  };
  sports = [
    { id: 1, name: 'Football' },
    { id: 2, name: 'Billiards' }
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
    private sportSpaceService: SportSpaceService,
    private userService: UserService,
    private subscriptionService: SubscriptionService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadSportSpaces();
    this.updateGamemodes();
  }

  loadSportSpaces(): void {
    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (data: any) => {
          this.userData = data;
          if (this.userData.roleType === 'P') {
            this.dataOwner = true;
            this.sportSpaceService.getSportSpacesByUserId(userId).subscribe((data: SportSpace[]) => {
              this.sportSpaces = data;
              this.filteredSportSpaces = data;
              this.updateCanAddMoreSportSpaces(userId);
            });
          } else {
            this.sportSpaceService.getAllSportSpaces().subscribe((data: SportSpace[]) => {
              this.sportSpaces = data;
              this.filteredSportSpaces = data;
            });
          }
        },
        (error: any) => {
          console.error('Error fetching user data:', error);
        }
      );
    }
  }

  private updateCanAddMoreSportSpaces(userId: string): void {
    this.subscriptionService.getSubscriptionbyUserId(userId).subscribe(
      (data: any) => {
        this.userSubscriptionData = data;
        this.maxSportSpaces = this.getMaxSportSpaces(data.planType);
        this.canAddMoreSportSpaces = this.sportSpaces.length < this.maxSportSpaces;
      }
    );
  }

  private getUserIdFromLocalStorage(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('userId');
    }
    return null;
  }

  private getMaxSportSpaces(planType: string): number {
    switch (planType) {
      case 'bronce':
        return 1;
      case 'plata':
        return 2;
      case 'oro':
        return 3;
      case 'free':
        return 0;
      default:
        return 0;
    }
  }

  addSportSpace(): void {
    const dialogRef = this.dialog.open(AddSportSpacesDialogComponent);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sportSpaceService.addSportSpace(result).subscribe(() => {
          this.loadSportSpaces();
        });
      }
    });
  }

  editSportSpace(sportSpace: SportSpace): void {
    const dialogRef = this.dialog.open(AddSportSpacesDialogComponent, {
      data: sportSpace
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.sportSpaceService.updateSportSpace(result).subscribe(() => {
          this.loadSportSpaces();
        });
      }
    });
  }

  applyFilters(): void {
    this.updateGamemodes();
    this.filteredSportSpaces = this.sportSpaces.filter(sportSpace => {
      return (!this.filter.sportId || sportSpace.sportId === this.filter.sportId) &&
        (!this.filter.gamemode || sportSpace.gamemode === this.filter.gamemode) &&
        (!this.filter.district || sportSpace.district === this.filter.district) &&
        (!this.filter.minPrice || sportSpace.price >= this.filter.minPrice) &&
        (!this.filter.maxPrice || sportSpace.price <= this.filter.maxPrice);
    });
  }

  clearFilters(): void {
    this.filter = {
      sportId: null,
      gamemode: '',
      district: '',
      minPrice: 0,
      maxPrice: 0
    };
    this.applyFilters();
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

  celebrate() {
    const duration = 6300;

    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.37 },
    });

    setTimeout(() => confetti.reset(), duration);
  }
}
