import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import {Router, RouterLink} from "@angular/router";
import {MatInputModule } from "@angular/material/input";
import {NgClass, NgIf} from "@angular/common";
import {ThemeService} from "../../../shared/services/theme.service";
import {TranslationService} from "../../../shared/services/translation.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    NgIf,
    RouterLink,
    NgClass,
    TranslatePipe
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  nameFormControl = new FormControl('', [Validators.required]);
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.required]);
  roleFormControl = new FormControl('', [Validators.required]);
  subscriptionFormControl = new FormControl('', [Validators.required]);
  bankAccountFormControl = new FormControl('', [Validators.required, Validators.email]);
  errorMessage: string | null = null;
  language: string = 'es';
  isDarkMode = false;

  constructor(private authService: AuthService,
              private router: Router,
              private themeService: ThemeService,
              private translationService: TranslationService) {
  }

  ngOnInit() {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      this.isDarkMode = isDarkMode;
      this.applyTheme();
    });
    if (typeof localStorage !== 'undefined') {
      this.language = localStorage.getItem('language') || 'es';
    } else {
      this.language = 'es';
    }
    this.subscriptionFormControl.disable();
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

  onSubmit() {
    if (this.nameFormControl.valid && this.emailFormControl.valid && this.passwordFormControl.valid && this.roleFormControl.valid && this.bankAccountFormControl.valid) {
      const user = {
        name: this.nameFormControl.value,
        email: this.emailFormControl.value,
        password: this.passwordFormControl.value,
        roles: [this.roleFormControl.value],
        bankAccount: this.bankAccountFormControl.value
      };

      this.authService.register(user).subscribe(
        () => {
          this.router.navigate(['/login']);
        },
        error => {
          if (error.message === 'User with this email already exists') {
            this.errorMessage = 'User with this email already exists';
          } else {
            this.errorMessage = 'An unknown error occurred';
          }
        }
      );
    }
  }
}
