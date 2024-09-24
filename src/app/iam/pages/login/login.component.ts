import { Component } from '@angular/core';
import {MatFormField} from "@angular/material/form-field";
import {MatInput, MatInputModule} from "@angular/material/input";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {AuthService} from "../../services/auth.service";
import {MatButton} from "@angular/material/button";
import {Router, RouterLink} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatInputModule,
    FormsModule,
    NgIf,
    MatButton,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl ('', [Validators.required]);

  constructor(private authService: AuthService, private router: Router) {
  }

  onSubmit() {
    if (this.emailFormControl.valid && this.passwordFormControl.valid) {
      const email = this.emailFormControl.value ?? '';
      const password = this.passwordFormControl.value ?? '';
      this.authService.login(email, password).subscribe(
        success => {
          this.router.navigate(['/home']);
        },
        error => {
        }
      );
    }
  }
}
