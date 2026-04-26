import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HabitsService, HabitDetail } from '../../services/habits.service';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-detail.component.html',
  styleUrl: './habit-detail.component.css'
})
export class HabitDetailComponent implements OnInit {
  isLoading = true;
  errorMessage = '';
  habit?: HabitDetail;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly habitsService: HabitsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const habitId = params.get('id');
      if (!habitId) {
        this.errorMessage = 'Habit identifier was not provided.';
        this.isLoading = false;
        return;
      }
      this.fetchHabit(habitId);
    });
  }

  private fetchHabit(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.habitsService.getHabitById(id).subscribe({
      next: (habit) => {
        this.habit = habit;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Unable to load habit details.';
        this.isLoading = false;
      }
    });
  }

  getReminderDisplay(): string {
    if (!this.habit) return '—';
    
    // If reminderTime is None or not set, return Not set
    if (!this.habit.reminderTime || this.habit.reminderTime === 'None') {
      return 'Not set';
    }

    // If we have both date and time, format it nicely
    if (this.habit.reminderDate && this.habit.reminderTime !== 'None') {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

      let dateLabel = '';
      if (this.habit.reminderDate === today) {
        dateLabel = 'Today';
      } else if (this.habit.reminderDate === tomorrow) {
        dateLabel = 'Tomorrow';
      } else if (this.habit.reminderDate === yesterday) {
        dateLabel = 'Yesterday';
      } else {
        const date = new Date(this.habit.reminderDate + 'T00:00:00');
        dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      }

      return `${dateLabel} at ${this.habit.reminderTime}`;
    }

    // If we only have time, just show the time
    return this.habit.reminderTime;
  }
}
