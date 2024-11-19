import {Component, OnInit} from '@angular/core';
import { NgIf } from "@angular/common";
import { SubscriptionService } from "../../services/subscription.service";
import {ThemeService} from "../../../shared/services/theme.service";
import {TranslatePipe, TranslateService} from "@ngx-translate/core";
import {jwtDecode} from "jwt-decode";

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    NgIf,
    TranslatePipe
  ],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {
  currentSubscription: number = 0;
  currentLanguage: string | undefined;

  constructor(
    private subscriptionService: SubscriptionService,
    private themeService: ThemeService,
    private translateService: TranslateService) {}

  ngOnInit(): void {
    this.setCurrentTheme();
    this.currentLanguage = this.translateService.currentLang;
    this.translateService.onLangChange.subscribe((event: any) => {
      this.currentLanguage = event.lang;
    });
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handlePaymentMessage.bind(this), false);
    }
    this.getUserSubscription();

  }

  setCurrentTheme(): void {
    this.themeService.isDarkMode$.subscribe(isDarkMode => {
      if (typeof document !== 'undefined') {
        if (isDarkMode) {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      }
    });
  }


  getUserSubscription(): void {
    const userId = this.getUserIdFromJwt();
    if (userId) {
      this.subscriptionService.getSubscriptionbyUserId(userId).subscribe(
        (data: any) => {
          this.currentSubscription = data.planId;
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

  updateSubscription(plan: string): void {
    const userId = this.getUserIdFromJwt();
    if (userId) {
      this.subscriptionService.updateSubscription(userId, plan);
    }
  }

  handlePaymentMessage(event: MessageEvent): void {
    if (event.data === 'paymentCompleted') {
      alert('Payment completed successfully!');
      this.getUserSubscription();
      window.close();
    }
  }
}
