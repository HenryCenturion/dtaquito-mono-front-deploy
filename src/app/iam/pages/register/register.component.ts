import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { MatFormField } from "@angular/material/form-field";
import { MatInput, MatInputModule } from "@angular/material/input";
import { NgIf } from "@angular/common";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatButton } from "@angular/material/button";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    ReactiveFormsModule,
    MatInput,
    MatInputModule,
    NgIf,
    MatSelect,
    MatOption,
    MatButton
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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.subscriptionFormControl.disable();
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
        (response: any) => {
          this.router.navigate(['/login']);
        },
        error => {
        }
      );
    }
  }
}
