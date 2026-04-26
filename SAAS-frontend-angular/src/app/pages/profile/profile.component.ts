import { Component, OnInit } from '@angular/core';
import { AuthService, AuthUser } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html', 
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  profile: AuthUser | null = null;
  username: string = '';
  maskedPassword = '••••••••••';
  planLabel = '';

  loading = false;
  errorMessage = '';

  showChangePassword = false;
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = '';

  showChangePlan = false;
  selectedPlan: 'basic' | 'premium' | 'pro' = 'basic';
  planLoading = false;
  planError = '';
  planSuccess = '';

  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadProfileFromSession();
    this.fetchProfileFromBackend();
  }

  /**
   * Username comes from session/token
   */
  private loadProfileFromSession(): void {
    const session = this.authService.currentUser;
    if (session?.user) {
      this.username = session.user.email;
    }
  }

  /**
   * Fetch authoritative profile data from backend
   */
  private fetchProfileFromBackend(): void {
    this.loading = true;
    this.errorMessage = '';

    this.http
      .get<{ user: AuthUser }>(`${environment.apiUrl}/auth/profile`, {
        headers: {
          Authorization: `Bearer ${this.authService.token}`
        }
      })
      .subscribe({
        next: (response) => {
          this.profile = response.user;
          this.planLabel = this.formatPlan(response.user.subscriptionPlan);
          this.loading = false;
        },
        error: (error) => {
          console.error('Failed to load profile', error);
          this.errorMessage = 'Failed to load profile';
          this.loading = false;
        }
      });
  }

  private formatPlan(plan?: 'basic' | 'premium' | 'pro'): string {
    switch (plan) {
      case 'pro':
        return 'Pro';
      case 'premium':
        return 'Premium';
      default:
        return 'Basic';
    }
  }

  openChangePassword(): void {
    this.showChangePassword = true;
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  closeChangePassword(): void {
    if (this.passwordLoading) return;
    this.showChangePassword = false;
  }

  submitPasswordChange(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Please fill out both password fields.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Passwords do not match.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.passwordError = 'Password must be at least 6 characters.';
      return;
    }

    this.passwordLoading = true;

    this.authService.updateProfile({ password: this.newPassword }).subscribe({
      next: () => {
        this.passwordSuccess = 'Password updated successfully.';
        this.passwordLoading = false;
        setTimeout(() => this.closeChangePassword(), 1200);
      },
      error: (error) => {
        this.passwordError = error.message || 'Failed to update password.';
        this.passwordLoading = false;
      }
    });
  }

  openChangePlan(): void {
    this.showChangePlan = true;
    this.planError = '';
    this.planSuccess = '';
    this.selectedPlan = this.profile?.subscriptionPlan || 'basic';
  }

  closeChangePlan(): void {
    if (this.planLoading) return;
    this.showChangePlan = false;
  }

  submitPlanChange(): void {
    this.planError = '';
    this.planSuccess = '';
    this.planLoading = true;

    this.authService.updateProfile({ subscriptionPlan: this.selectedPlan }).subscribe({
      next: (res) => {
        this.profile = res.user;
        this.planLabel = this.formatPlan(res.user.subscriptionPlan);
        this.planSuccess = 'Plan updated successfully.';
        this.planLoading = false;
        setTimeout(() => this.closeChangePlan(), 1200);
      },
      error: (error) => {
        this.planError = error.message || 'Failed to update plan.';
        this.planLoading = false;
      }
    });
  }
}