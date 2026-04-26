import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
  icon: string;
}

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.css'
})
export class SubscriptionComponent {
  isLoggedIn = false;
  selectedPlan: string | null = null;

  plans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for getting started with habit tracking',
      price: 0,
      period: 'forever',
      icon: '🌱',
      features: [
        'Track up to 3 habits',
        'Basic streak tracking',
        'Daily reminders',
        'Progress charts',
        'Community support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'For serious habit builders who want more features',
      price: 9.99,
      period: 'month',
      icon: '⭐',
      popular: true,
      features: [
        'Unlimited habits',
        'Advanced analytics',
        'Smart reminders',
        'Custom categories',
        'Export reports',
        'Priority support',
        'Mobile app access'
      ]
    }
  ];

  constructor(public authService: AuthService) {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }

  selectPlan(planId: string): void {
    this.selectedPlan = planId;
    // Dummy subscription - just show a message
    const plan = this.plans.find(p => p.id === planId);
    if (plan) {
      if (plan.price === 0) {
        alert(`🎉 You've selected the ${plan.name} plan!\n\nThis is a demo. No payment required.`);
      } else {
        alert(`🎉 You've selected the ${plan.name} plan at $${plan.price}/${plan.period}!\n\nThis is a demo. No payment gateway connected.`);
      }
    }
  }

  getYearlyPrice(monthlyPrice: number): number {
    return monthlyPrice * 12 * 0.8; // 20% discount for yearly
  }
}

