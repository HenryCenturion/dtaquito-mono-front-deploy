import {CanActivate, CanActivateFn, Router} from '@angular/router';
import {AuthService} from "../../iam/services/auth.service";

export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/home']);
      return false;
    }
  }
}
