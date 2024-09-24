import { Injectable } from '@angular/core';
import {
  HttpClient, HttpErrorResponse,
} from "@angular/common/http";
import { HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";
import {BehaviorSubject, catchError, Observable, tap, throwError} from "rxjs";
import {User} from "../../business/models/user.model";
import {UserService} from "../../business/services/user.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private LOGIN_URL = 'https://dtaquito-backend.azurewebsites.net/api/v1/authentication/sign-in';
  private tokenKey = 'authToken';
  private userIdKey = 'userId';
  private currentUserSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient, private userService: UserService) { }

  register(user: any): Observable<any> {
    return this.userService.createUser(user);
  }

  login(email: string, password: string): Observable<User> {
    const body = { email: email, password: password };

    return this.http.post<User>(this.LOGIN_URL, body).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
          this.setUserId(response.id);
          this.currentUserSubject.next(response);
        }
      })
    );
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private setUserId(userId: number): void {
    localStorage.setItem(this.userIdKey, userId.toString());
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(this.tokenKey);
    }
    return null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000;
    return Date.now() < exp;
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
