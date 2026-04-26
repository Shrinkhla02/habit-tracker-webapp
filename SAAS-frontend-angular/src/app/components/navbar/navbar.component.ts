import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  showUserMenu = false;

  navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Habits', path: '/habits' },
    { label: 'Reports', path: '/reports' },
    { label: 'Reminders', path: '/reminders' },
    { label: 'Pricing', path: '/subscription' }
  ];

  constructor(
    public readonly authService: AuthService,
    private readonly router: Router
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.showUserMenu = false;
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.router.navigate(['/login']);
  }
}
