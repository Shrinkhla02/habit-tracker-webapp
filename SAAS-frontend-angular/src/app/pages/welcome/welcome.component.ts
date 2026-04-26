import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HabitsService, HabitSummary } from '../../services/habits.service';
import { ReportsService } from '../../services/reports.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  loading = true;
  userStats: any = null;
  recentHabits: HabitSummary[] = [];
  todayCompletions = 0;
  nextReminder: { habit: string; dateLabel: string; time: string; dateTime: Date } | null = null;
  countdown: string = '';
  private countdownInterval: any = null;

  // Static stats for non-logged-in users
  heroStats = [
    { label: 'Habits Tracked', value: '50K+' },
    { label: 'Avg. Success Rate', value: '85%' },
    { label: 'Daily Check-ins', value: '120K' }
  ];

  featureCards = [
    {
      icon: '📈',
      title: 'Visual Progress',
      description: 'Glanceable charts help you stay accountable and celebrate streaks.'
    },
    {
      icon: '🤖',
      title: 'AI Habit Coach',
      description: 'Personalized nudges keep you consistent when motivation dips.'
    },
    {
      icon: '⏰',
      title: 'Smart Reminders',
      description: 'Adaptive reminders fit your rhythm, not the other way around.'
    },
    {
      icon: '🎯',
      title: 'Goal Pathways',
      description: 'Break big goals into micro habits with progress milestones.'
    }
  ];

  workflowSteps = [
    {
      number: '01',
      title: 'Define Your Habit Blueprint',
      description: 'Set intention, schedule, and accountability in under five minutes.'
    },
    {
      number: '02',
      title: 'Track with Guided Nudges',
      description: 'Daily prompts and reflections keep progress top-of-mind.'
    },
    {
      number: '03',
      title: 'Review & Celebrate',
      description: 'See trends, spot blockers, and keep momentum with data-driven wins.'
    }
  ];

  testimonials = [
    {
      quote:
        'BetterMe transformed the way our wellness team builds lasting routines. The streak insights are game changing.',
      author: 'Sara Mitchell',
      role: 'Head of People Ops, Flow Labs'
    },
    {
      quote:
        'I tried a dozen habit apps. This is the first that adapts to my day instead of nagging me. I finally hit my 90-day meditation streak.',
      author: 'Andre Lewis',
      role: 'Product Designer'
    }
  ];

  constructor(
    private readonly authService: AuthService,
    private readonly habitsService: HabitsService,
    private readonly reportsService: ReportsService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Check if user is logged in
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.loading = false;
      
      if (this.isLoggedIn) {
        this.loadUserData();
      }
    });
  }

  loadUserData(): void {
    // Load user's habits
    this.habitsService.getHabits().subscribe({
      next: (habits) => {
        this.recentHabits = habits.slice(0, 3); // Get first 3 habits
        this.updateHeroStats(habits);
      },
      error: (error) => {
        console.error('Error loading habits:', error);
      }
    });

    // Load user's stats
    this.reportsService.getReports().subscribe({
      next: (stats) => {
        this.userStats = stats;
        this.updateHeroStatsWithStats(stats);
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  private updateHeroStats(habits: HabitSummary[]): void {
    const activeHabits = habits.filter(h => h.isActive !== false);
    const totalStreak = habits.reduce((sum, h) => sum + (h.currentStreak || 0), 0);
    const avgStreak = activeHabits.length > 0 ? Math.round(totalStreak / activeHabits.length) : 0;

    this.heroStats = [
      { label: 'Your Habits', value: `${activeHabits.length}` },
      { label: 'Avg. Streak', value: `${avgStreak} days` },
      { label: 'Total Completions', value: `${habits.reduce((sum, h) => sum + (h.bestStreak || 0), 0)}` }
    ];

    this.updateNextReminder(habits);
  }

  private updateHeroStatsWithStats(stats: any): void {
    if (stats) {
      this.heroStats = [
        { label: 'Active Habits', value: `${stats.totalHabits}` },
        { label: 'Completion Rate', value: `${stats.completionRate}%` },
        { label: 'Total Completed', value: `${stats.totalCompleted}` }
      ];
    }
  }

  private updateNextReminder(habits: HabitSummary[]): void {
    const upcoming = habits
      .filter(
        (habit) =>
          !!habit.reminderDate &&
          !!habit.reminderTime &&
          habit.reminderTime !== 'None'
      )
      .map((habit) => {
        const dateTime = new Date(`${habit.reminderDate}T${habit.reminderTime}`);
        console.log('Parsing reminder:', {
          reminderDate: habit.reminderDate,
          reminderTime: habit.reminderTime,
          dateTimeString: `${habit.reminderDate}T${habit.reminderTime}`,
          parsedDate: dateTime,
          isValid: !isNaN(dateTime.getTime())
        });
        return {
          habit: habit.name ?? 'Habit reminder',
          date: habit.reminderDate as string,
          time: habit.reminderTime as string,
          dateTime
        };
      })
      .filter((item) => !isNaN(item.dateTime.getTime()))
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    if (upcoming.length === 0) {
      this.nextReminder = null;
      this.countdown = '';
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      return;
    }

    const next = upcoming[0];
    this.nextReminder = {
      habit: next.habit,
      dateLabel: this.getFriendlyDateLabel(next.date),
      time: next.time,
      dateTime: next.dateTime
    };
    
    console.log('Next reminder set:', this.nextReminder);
    
    // Start countdown timer
    this.startCountdown();
  }
  
  private startCountdown(): void {
    // Clear any existing interval
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    
    console.log('Starting countdown timer');
    
    // Update countdown immediately
    this.updateCountdown();
    
    // Update countdown every second
    this.countdownInterval = setInterval(() => {
      this.updateCountdown();
    }, 1000);
  }
  
  private updateCountdown(): void {
    if (!this.nextReminder || !this.nextReminder.dateTime) {
      this.countdown = '';
      this.cdr.detectChanges();
      return;
    }
    
    const now = new Date();
    const target = new Date(this.nextReminder.dateTime);
    const diff = target.getTime() - now.getTime();
    
    if (diff <= 0) {
      this.countdown = 'Time\'s up!';
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      this.cdr.detectChanges();
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
      this.countdown = `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
      this.countdown = `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      this.countdown = `${minutes}m ${seconds}s`;
    } else {
      this.countdown = `${seconds}s`;
    }
    
    // Force change detection to update the view
    this.cdr.detectChanges();
  }
  
  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  private getFriendlyDateLabel(dateString: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const target = new Date(dateString + 'T00:00:00');
    target.setHours(0, 0, 0, 0);

    const diff = (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';

    return target.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  get greeting(): string {
    if (!this.isLoggedIn) return '';
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  get userName(): string {
    return this.authService.currentUser?.user?.name || '';
  }

  getProgressPercentage(habit: HabitSummary): number {
    if (!habit.bestStreak || habit.bestStreak === 0) return 20;
    const current = habit.currentStreak || 0;
    const best = habit.bestStreak || 1;
    return Math.min(100, Math.round((current / best) * 100));
  }

  getAverageProgress(): number {
    if (this.recentHabits.length === 0) return 0;
    const total = this.recentHabits.reduce((sum, h) => sum + this.getProgressPercentage(h), 0);
    return Math.round(total / this.recentHabits.length);
  }
}
