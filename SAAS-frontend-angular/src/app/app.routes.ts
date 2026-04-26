import { Routes } from '@angular/router';
import { WelcomeComponent } from './pages/welcome/welcome.component';
import { HabitsListComponent } from './pages/habits-list/habits-list.component';
import { HabitDetailComponent } from './pages/habit-detail/habit-detail.component';
import { HabitFormComponent } from './pages/habit-form/habit-form.component';
import { ReportsComponent } from './pages/reports/reports.component';
import { RemindersComponent } from './pages/reminders/reminders.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { SubscriptionComponent } from './pages/subscription/subscription.component';
import { authGuard } from './auth.guard';
import { ProfileComponent } from './pages/profile/profile.component';

export const routes: Routes = [
  { path: '', component: WelcomeComponent, title: 'BetterMe | Habit Tracker' },
  {
    path: 'habits',
    component: HabitsListComponent,
    title: 'Your Habits',
    canActivate: [authGuard]
  },
  {
    path: 'habits/new',
    component: HabitFormComponent,
    title: 'Create Habit',
    canActivate: [authGuard]
  },
  {
    path: 'habits/:id',
    component: HabitDetailComponent,
    title: 'Habit Details',
    canActivate: [authGuard]
  },
  {
    path: 'habits/:id/edit',
    component: HabitFormComponent,
    title: 'Edit Habit',
    canActivate: [authGuard]
  },
  {
    path: 'reports',
    component: ReportsComponent,
    title: 'Habit Reports',
    canActivate: [authGuard]
  },
  {
    path: 'reminders',
    component: RemindersComponent,
    title: 'Smart Reminders',
    canActivate: [authGuard]
  },
  { 
    path: 'login', 
    component: LoginComponent, 
    title: 'Sign In' 
  },
  { 
    path: 'register', 
    component: RegisterComponent, 
    title: 'Create Account' 
  },
  { 
    path: 'subscription', 
    component: SubscriptionComponent, 
    title: 'Pricing Plans' 
  },
  {
    path: 'profile', 
    component: ProfileComponent, 
    title: 'User Profile', 
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
