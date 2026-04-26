import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RemindersService } from './reminders.service';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reminders.component.html',
  styleUrl: './reminders.component.css'
})
export class RemindersComponent implements OnInit {
  upcomingReminders: any[] = [];

  channels = [
    { label: 'Mobile Push', description: 'Real-time pings on iOS & Android.' },
    { label: 'Email Digest', description: 'Daily briefing with insights.' },
    { label: 'Slack Bot', description: 'Bring your habits into team rituals.' },
    { label: 'SMS', description: 'Minimal reminders for focus.' }
  ];
  cadenceModalOpen = false;
  selectedReminderIndex: number | null = null;
  selectedDate: string = '';
  selectedTime: string = '';
  
  constructor(
    private remindersService: RemindersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadReminders();
  }  loadReminders() {
    console.log('Loading habits from API...');
    
    // Get userId from AuthService
    const userId = this.authService.userId;
    const currentUser = this.authService.currentUser;
    
    console.log('Current user:', currentUser);
    console.log('User ID:', userId);
    
    if (!userId) {
      console.error('No user found or user not logged in');
      alert('Please login to view reminders');
      this.router.navigate(['/login']);
      return;
    }
    
    this.remindersService.getAllHabitsByUserId(userId).subscribe({
      next: (response) => {
        console.log('Habits API response:', response);
        if (response.success) {
          this.upcomingReminders = response.data.map((habit: any) => ({
            _id: habit._id,
            habit: habit.name || 'Unknown Habit',
            date: habit.reminderDate || null,
            time: habit.reminderTime || 'None',
            channel: this.getReminderChannel(habit.reminder),
            tone: this.getReminderTone(habit.category)
          }));
          console.log('Loaded habits as reminders:', this.upcomingReminders);
        }
      },
      error: (error) => {
        console.error('Error loading habits:', error);
        console.error('Error details:', error.message, error.status);
        alert('Failed to load habits. Please make sure the backend server is running and check your API configuration.');
      }
    });
  }

  getHabitInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : 'H';
  }

  getReminderChannel(reminder: string): string {
    const channels: any = {
      'morning': 'Mobile push',
      'afternoon': 'Email digest',
      'evening': 'Slack DM'
    };
    return channels[reminder] || 'Email';
  }

  getReminderTone(category: string): string {
    const tones: any = {
      'health': 'Calm cue',
      'fitness': 'Motivational boost',
      'learning': 'Curious nudge',
      'productivity': 'Focus reminder',
      'other': 'Friendly ping'
    };
    return tones[category] || 'Friendly ping';
  }

  openCadenceModal(index: number) {
    this.selectedReminderIndex = index;
    const reminder = this.upcomingReminders[index];
    
    // If time is None or null, set default values
    if (!reminder.date || reminder.time === 'None') {
      this.selectedDate = new Date().toISOString().split('T')[0];
      this.selectedTime = '09:00';
    } else {
      this.selectedDate = reminder.date;
      this.selectedTime = reminder.time;
    }
    
    this.cadenceModalOpen = true;
  }

  closeCadenceModal() {
    this.cadenceModalOpen = false;
    this.selectedReminderIndex = null;
  }

  saveCadence() {
    if (this.selectedReminderIndex === null) return;

    const reminder = this.upcomingReminders[this.selectedReminderIndex];
    this.remindersService.updateHabitReminderTime(reminder._id, this.selectedDate, this.selectedTime).subscribe({
      next: (response: any) => {
        if (response.success) {
          reminder.date = this.selectedDate;
          reminder.time = this.selectedTime;
          console.log('Reminder time updated successfully');
          this.closeCadenceModal();
        }
      },
      error: (error: any) => {
        console.error('Error updating reminder:', error);
        alert('Failed to update reminder time');
      }
    });
  }

  getDisplayTime(reminder: any): string {
    // If no date or time is None, show "Not set"
    if (!reminder.date || reminder.time === 'None') {
      return 'Not set';
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let dateLabel = '';
    if (reminder.date === today) {
      dateLabel = 'Today';
    } else if (reminder.date === tomorrow) {
      dateLabel = 'Tomorrow';
    } else if (reminder.date === yesterday) {
      dateLabel = 'Yesterday';
    } else {
      const date = new Date(reminder.date + 'T00:00:00');
      dateLabel = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }

    return `${dateLabel} · ${reminder.time}`;
  }
}
