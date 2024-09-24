import {Component, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import {NgIf} from "@angular/common";
import {AuthService} from "../../../iam/services/auth.service";
import {User} from "../../../business/models/user.model";
import {UserService} from "../../../business/services/user.service";
import {DepositService} from "../../../business/services/deposit.service";
import {MatDialog} from "@angular/material/dialog";
import {
  CreateDepositDialogComponent
} from "../../../business/components/create-deposit-dialog/create-deposit-dialog.component";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    MatToolbar,
    MatIcon,
    MatIconButton,
    NgIf
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  currentUser: User | null = null;
  userData: any | undefined;
  dataOwner: boolean = false;
  dataPlayer: boolean = false;
  userCredits: number = 0;

  constructor(private authService: AuthService,
              private userService: UserService,
              private depositService: DepositService,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
    this.getUser();
  }

  logout() {
    this.authService.logout();
  }

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }

  getUser(): void {
    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (data: any) => {
          this.userData = data;
          this.userCredits = this.userData.credits;
          if (this.userData.roleType === 'P') {
            this.dataOwner = true;
          }else{
            this.dataPlayer = true;
          }
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


  reloadCredits(): void {
    const dialogRef = this.dialog.open(CreateDepositDialogComponent, {
      width: '300px'
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }
}
