import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HabitsService, HabitSummary } from '../../services/habits.service';
import { HabitLogsService } from '../../services/habit-logs.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-habits-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habits-list.component.html',
  styleUrl: './habits-list.component.css'
})
export class HabitsListComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  habits: HabitSummary[] = [];
  isDeleting = false;
  habitToDelete: any = null;
  showDeleteModal = false;
  completingHabits = new Set<string>(); // Track which habits are being marked complete

  constructor(
    private readonly habitsService: HabitsService,
    private readonly habitLogsService: HabitLogsService,
    private readonly authService: AuthService
  ) {}

  get userPlan(): string {
    return this.authService.userPlan;
  }

  get habitLimit(): number {
    return this.authService.habitLimit;
  }

  get habitCount(): number {
    return this.habits.length;
  }

  get isAtLimit(): boolean {
    const limit = this.habitLimit;
    return limit > 0 && this.habitCount >= limit;
  }

  ngOnInit(): void {
    this.loadHabits();
  }

  trackByHabitId(_: number, habit: HabitSummary): string {
    return habit._id;
  }

  loadHabits(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.habitsService.getHabits().subscribe({
      next: (habits) => {
        this.habits = habits;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Unable to load habits.';
        this.isLoading = false;
      }
    });
  }

  getReminderDisplay(habit: HabitSummary): string {
    // If reminderTime is None or not set, return dash
    if (!habit.reminderTime || habit.reminderTime === 'None') {
      return '—';
    }

    // If we have both date and time, format it nicely
    if (habit.reminderDate && habit.reminderTime !== 'None') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let dateLabel = '';
      if (habit.reminderDate === today) {
        dateLabel = 'Today';
      } else if (habit.reminderDate === tomorrow) {
        dateLabel = 'Tomorrow';
      } else if (habit.reminderDate === yesterday) {
        dateLabel = 'Yesterday';
      } else {
        const date = new Date(habit.reminderDate + 'T00:00:00');
        dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      return `${dateLabel} · ${habit.reminderTime}`;
    }

    // If we only have time, just show the time
    return habit.reminderTime;
  }

  openDeleteModal(habit: any): void {
    this.habitToDelete = habit
    this.showDeleteModal = true;
  }

  onCancelDelete(): void {
    this.showDeleteModal = false;
    this.habitToDelete = null;
  }

  onConfirmDelete(): void {
    if (!this.habitToDelete || !this.habitToDelete._id) {
      this.showDeleteModal = false;
      this.habitToDelete = null;
      return;
    }

    const habitId = this.habitToDelete._id;
    this.isDeleting = true;

    this.habitsService.deleteHabit(habitId).subscribe({
      next: () => {
        // Optimistically update the list in the UI
        this.habits = this.habits.filter(h => h._id !== habitId);
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.habitToDelete = null;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Unable to delete habit.';
        this.isDeleting = false;
        this.showDeleteModal = false;
        this.habitToDelete = null;
      }
    });
  }

  onToggleComplete(habit: HabitSummary, completed: boolean, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    
    if (!completed) {
      return;
    }

    // Prevent multiple submissions for the same habit
    if (this.completingHabits.has(habit._id)) {
      checkbox.checked = false;
      return;
    }

    this.completingHabits.add(habit._id);
    this.errorMessage = '';

    // Create a habit log entry
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    this.habitLogsService.createHabitLog({
      habitId: habit._id,
      completedDate: today,
      isCompleted: true,
      duration: 1 // Default duration in minutes
    }).subscribe({
      next: (log) => {
        console.log('Habit marked as complete:', log);
        
        // Reload habits from server to get updated streak data
        this.habitsService.getHabitById(habit._id).subscribe({
          next: (updatedHabit) => {
            // Update the habit in the list with the latest data from server
            const index = this.habits.findIndex(h => h._id === habit._id);
            if (index !== -1) {
              this.habits[index] = { ...this.habits[index], ...updatedHabit };
            }
            this.completingHabits.delete(habit._id);
          },
          error: (err) => {
            console.error('Error refreshing habit data:', err);
            // Still remove from completing set and use optimistic update
            const current = habit.currentStreak || 0;
            habit.currentStreak = current + 1;
            if (habit.currentStreak > (habit.bestStreak || 0)) {
              habit.bestStreak = habit.currentStreak;
            }
            habit.lastCompletedDate = today;
            this.completingHabits.delete(habit._id);
          }
        });
        
        // Uncheck the checkbox after successful completion
        setTimeout(() => {
          checkbox.checked = false;
        }, 500);
      },
      error: (error) => {
        console.error('Error marking habit as complete:', error);
        this.errorMessage = error.message || 'Failed to mark habit as complete. Please try again.';
        this.completingHabits.delete(habit._id);
        checkbox.checked = false;
      }
    });
  }

  isCompletingHabit(habitId: string): boolean {
    return this.completingHabits.has(habitId);
  }
}
