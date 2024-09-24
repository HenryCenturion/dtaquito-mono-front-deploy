import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { MatTab, MatTabGroup } from "@angular/material/tabs";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { NgIf } from "@angular/common";
import { SubscriptionService } from "../../services/subscription.service";

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    MatTabGroup,
    MatTab,
    MatIconButton,
    MatIcon,
    NgIf
  ],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent implements OnInit {
  currentSubscription: number = 0;

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('message', this.handlePaymentMessage.bind(this), false);
    }
    this.getUserSubscription();

  }


  getUserSubscription(): void {
    const userId = this.getUserIdFromLocalStorage();
    if (userId) {
      this.subscriptionService.getSubscriptionbyUserId(userId).subscribe(
        (data: any) => {
          this.currentSubscription = data.planId;
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

  updateSubscription(plan: string): void {
    const userId = this.getUserIdFromLocalStorage();
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
