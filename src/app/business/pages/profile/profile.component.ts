import { Component, OnInit } from '@angular/core';
import { User } from "../../models/user.model";
import { UserService } from "../../services/user.service";
import { MatDrawer, MatDrawerContainer } from "@angular/material/sidenav";
import { NgIf } from "@angular/common";
import { MatButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from "@angular/material/expansion";
import { FormsModule } from "@angular/forms";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatDrawerContainer,
    MatDrawer,
    NgIf,
    MatButton,
    MatIcon,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatExpansionPanelHeader,
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  newPassword: string = '';
  originalUser: User | null = null;
  isEditing: boolean = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (data: User) => {
          this.user = { ...data };
          this.originalUser = { ...data };
        },
        (error: any) => {
          console.error('Error fetching user data', error);
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

  getRoleDescription(roleType: string): string {
    switch (roleType) {
      case 'R':
        return 'Player';
      case 'P':
        return 'Propietario';
      default:
        return 'Unknown Role';
    }
  }

  onSubmit(): void {
    if (this.user) {
      if (this.newPassword) {
        this.user.password = this.newPassword;
      }
      this.userService.updateUser(this.user).subscribe(
        () => {
          location.reload();
        }
      );
    }
  }

  onCancel(): void {
    if (this.originalUser) {
      this.user = { ...this.originalUser };
      this.newPassword = '';
      this.isEditing = false;
    }
  }

  isFormValid(): boolean {
    return !!(this.user?.name && this.user?.email && this.newPassword);
  }

  startEditing(): void {
    this.isEditing = true;
  }
}
