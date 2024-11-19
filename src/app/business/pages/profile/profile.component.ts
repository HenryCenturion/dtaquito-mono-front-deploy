import { Component, OnInit } from '@angular/core';
import { User } from "../../models/user.model";
import { UserService } from "../../services/user.service";
import {NgIf} from "@angular/common";
import { MatIcon } from "@angular/material/icon";
import { FormsModule } from "@angular/forms";
import {ThemeService} from "../../../shared/services/theme.service";
import {TranslatePipe} from "@ngx-translate/core";
import {AuthService} from "../../../iam/services/auth.service";
import {TranslationService} from "../../../shared/services/translation.service";
import {jwtDecode} from "jwt-decode";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf,
    MatIcon,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  newPassword: string = '';
  originalUser: User | null = null;
  language: string = 'en';
  isDarkMode = false;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private themeService: ThemeService,
    private translationService: TranslationService) {}

  ngOnInit(): void {

    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
      this.applyTheme();
    });

    this.language = localStorage.getItem('language') || 'en';

    const userId = this.getUserIdFromJwt();
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

  toggleDarkMode() {
    this.themeService.toggleDarkMode();
  }

  changeLanguage(): void {
    this.language = this.language === 'en' ? 'es' : 'en';
    localStorage.setItem('language', this.language);
    this.translationService.setLanguage(this.language);
  }


  applyTheme(): void {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      if (typeof document !== 'undefined') {
        if (isDarkMode) {
          document.body.classList.add('dark');
        } else {
          document.body.classList.remove('dark');
        }
      }
    });
  }

  private getUserIdFromJwt(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const token = localStorage.getItem('authToken'); // Usando la clave 'authToken'
      if (token) {
        const decoded: any = jwtDecode(token);
        return decoded.userId || null; // Ajusta esto según la estructura de tu token
      }
    }
    return null;
  }

  getRoleDescription(roleType: string): string {
    switch (roleType) {
      case 'R':
        return 'Player';
      case 'P':
        return 'Owner';
      default:
        return 'Unknown Role';
    }
  }

  onSubmit(): void {
    if (this.user) {
      if (this.newPassword) {
        this.user.password = this.newPassword;
      }
      // this.userService.updateUser(this.user).subscribe(
      //   () => {
      //     location.reload();
      //   }
      // );
    }
  }

  isFormChanged(): boolean {
    if (!this.user || !this.originalUser) return false;
    return this.user.name !== this.originalUser.name || this.user.email !== this.originalUser.email || this.newPassword !== '';
  }

  isEmailValid(): boolean {
    if (!this.user || !this.user.email) {
      return false;
    }

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(this.user.email);
  }

  logout() {
    this.authService.logout();
  }
}
