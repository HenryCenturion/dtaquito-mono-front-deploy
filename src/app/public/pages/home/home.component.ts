import {Component, OnInit} from '@angular/core';
import {ThemeService} from "../../../shared/services/theme.service";
import {FormsModule} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {AuthService} from "../../../iam/services/auth.service";
import {TranslationService} from "../../../shared/services/translation.service";
import {User} from "../../../business/models/user.model";
import {UserService} from "../../../business/services/user.service";
import {jwtDecode} from "jwt-decode";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    RouterLink,
    TranslatePipe,
    NgClass
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {

  currentUser: User | null = null;
  userData: any | undefined;
  dataOwner: boolean = false;
  dataPlayer: boolean = false;
  language: string = 'en';
  isDarkMode = false;

  constructor(private authService: AuthService,
              private router: Router,
              private userService: UserService,
              private themeService: ThemeService,
              private translationService: TranslationService) {
  }


  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
      this.applyTheme();
    });
    if (typeof localStorage !== 'undefined') {
      this.language = localStorage.getItem('language') || 'en';
    } else {
      this.language = 'en';
    }
    this.getUser();
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

  getUser(): void {
    const userId = this.getUserIdFromJwt();
    if (userId) {
      this.userService.getUserById(userId).subscribe(
        (data: any) => {
          this.userData = data;
          if (this.userData.roleType === 'P') {
            this.dataOwner = true;
          }else{
            this.dataPlayer = true;
          }
        }
      );
    }
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

  isAuthenticated() {
    return this.authService.isAuthenticated();
  }
}
