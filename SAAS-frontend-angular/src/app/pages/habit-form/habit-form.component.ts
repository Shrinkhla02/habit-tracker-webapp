import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitsService, HabitDetail } from '../../services/habits.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './habit-form.component.html',
  styleUrl: './habit-form.component.css'
})
export class HabitFormComponent implements OnInit {
  readonly categories = [
    { label: 'Health', value: 'health' },
    { label: 'Fitness', value: 'fitness' },
    { label: 'Learning', value: 'learning' },
    { label: 'Productivity', value: 'productivity' },
    { label: 'Other', value: 'other' }
  ];

  readonly frequencies = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  readonly reminderFrequency = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
    { label: 'Monthly', value: 'monthly' }
  ];

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    category: ['health', Validators.required],
    frequency: ['daily', Validators.required],
    reminderFrequency: [''],
    reminderTime: ['08:00'],
    daysOfWeek: this.fb.group({
      mon: [true],
      tue: [false],
      wed: [false],
      thu: [false],
      fri: [false],
      sat: [false],
      sun: [false]
    }),
    dayOfMonth: [1],
    monthlyDate: [''],
    notes: ['']
  });

  isSubmitting = false;
  isLoadingHabit = false;
  successMessage = '';
  errorMessage = '';
  habitId?: string;

  get pageTitle(): string {
    return this.habitId ? 'Edit Habit' : 'Create Habit';
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly habitsService: HabitsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.habitId = id;
        this.fetchHabit(id);
      }
    });

    // Dynamic validation based on reminderFrequency (optional field)
    this.form.get('reminderFrequency')?.valueChanges.subscribe((rf) => {
      const timeCtrl = this.form.get('reminderTime');
      const domCtrl = this.form.get('dayOfMonth');
      const dateCtrl = this.form.get('monthlyDate');

      // Clear validators first
      timeCtrl?.clearValidators();
      domCtrl?.clearValidators();
      dateCtrl?.clearValidators();

      if (rf === 'daily') {
        timeCtrl?.setValidators([Validators.required]);
      } else if (rf === 'weekly') {
        timeCtrl?.setValidators([Validators.required]);
        // daysOfWeek selection will be checked in onSubmit()
      } else if (rf === 'monthly') {
        timeCtrl?.setValidators([Validators.required]);
        dateCtrl?.setValidators([Validators.required]);
      }

      timeCtrl?.updateValueAndValidity({ emitEvent: false });
      domCtrl?.updateValueAndValidity({ emitEvent: false });
      dateCtrl?.updateValueAndValidity({ emitEvent: false });
    });

    this.form.get('monthlyDate')?.valueChanges.subscribe((value) => {
      if (value) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          this.form.get('dayOfMonth')?.setValue(date.getDate(), { emitEvent: false });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    const { name, description, category, frequency, reminderFrequency, notes } =
      this.form.value;

      // If user selected a reminder cadence, enforce its specific validations
      if (reminderFrequency) {
        if (reminderFrequency === 'weekly' && !this.atLeastOneDaySelected()) {
          this.errorMessage = 'Please select at least one day of the week.';
          return;
        }
      }
      // Build a strongly-typed daysOfWeek array to satisfy HabitDetail type
      const selectedDays = Object.entries(this.form.get('daysOfWeek')?.value || {})
        .filter(([k, v]) => !!v && (['mon','tue','wed','thu','fri','sat','sun'] as const).includes(k as any))
        .map(([k]) => k as 'mon'|'tue'|'wed'|'thu'|'fri'|'sat'|'sun');

      const payload: Partial<HabitDetail> = {
        name: name?.trim() ?? '',
        description: description?.trim() || undefined,
        category: category ?? undefined,
        frequency: frequency ?? undefined,
        reminderFrequency: reminderFrequency || undefined,
        // Only include reminder details if cadence chosen
        ...(reminderFrequency ? { reminderTime: this.form.get('reminderTime')?.value || undefined } : {}),
          ...(reminderFrequency === 'weekly' ? {
          daysOfWeek: (selectedDays.length ? selectedDays : undefined) as HabitDetail['daysOfWeek']
        } : {}),
        ...(reminderFrequency === 'monthly' ? { dayOfMonth: this.form.get('dayOfMonth')?.value || undefined } : {}),
        notes: notes?.trim() || undefined
      };

    const request$ = this.habitId
      ? this.habitsService.updateHabit(this.habitId, payload)
      : this.habitsService.createHabit(payload);

    request$.subscribe({
      next: (habit) => {
        this.successMessage = this.habitId
          ? 'Habit updated successfully.'
          : 'Habit created successfully.';
        this.isSubmitting = false;
        if (!this.habitId) {
          this.form.reset({
            name: '',
            description: '',
            category: 'health',
            frequency: 'daily',
            reminderFrequency: '',
            reminderTime: '08:00',
            daysOfWeek: {mon: false, tue: false, wed: false, thu: false, fri: false, sat: false, sun: false},
            dayOfMonth: 1,
            monthlyDate: '',
            notes: ''
          });
        } else {
          this.router.navigate(['/habits', habit._id]);
        }
      },
      error: (error) => {
        this.errorMessage = error.message || 'We could not save the habit. Please retry.';
        this.isSubmitting = false;
      }
    });
  }

  get name() {
    return this.form.get('name');
  }

  get frequency() {
    return this.form.get('frequency');
  }

  private fetchHabit(id: string): void {
    this.isLoadingHabit = true;
    this.habitsService.getHabitById(id).subscribe({
      next: (habit: HabitDetail) => {
        this.form.patchValue({
          name: habit.name,
          description: habit.description ?? '',
          category: habit.category ?? 'health',
          frequency: habit.frequency ?? 'daily',
          reminderFrequency: habit.reminderFrequency ?? 'daily',
          notes: habit.notes ?? ''
        });
        this.isLoadingHabit = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Unable to load habit for editing.';
        this.isLoadingHabit = false;
      }
    });
  }


  // Helper to check at least one weekday selected (for weekly reminders)
  atLeastOneDaySelected(): boolean {
    const days = this.form.get('daysOfWeek');
    if (!days) return false;
    const value = (days.value as Record<string, boolean>) || {};
    return Object.values(value).some(Boolean);
  }

  get reminderSummary(): string | null {
    const rf = this.form.get('reminderFrequency')?.value as string | null | undefined;
    if (!rf) {
      return null;
    }
  
    const time = this.form.get('reminderTime')?.value as string | null | undefined;
  
    if (rf === 'daily') {
      if (!time) return null;
      return `You will get a daily reminder at ${time}.`;
    }
  
    if (rf === 'weekly') {
      const daysLabel = this.getSelectedDaysLabel();
      if (!time || !daysLabel) return null;
      return `You will get a reminder on ${daysLabel} at ${time} every week.`;
    }
  
    if (rf === 'monthly') {
      const dateStr = this.form.get('monthlyDate')?.value as string | null | undefined;
      if (!time || !dateStr) return null;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return null;
  
      const day = date.getDate();
      const dayWithSuffix = this.getOrdinalSuffix(day);
  
      return `You will get a reminder on the ${dayWithSuffix} at ${time} every month.`;
    }
  
    return null;
  }
  
  private getSelectedDaysLabel(): string | null {
    const daysGroup = this.form.get('daysOfWeek');
    if (!daysGroup) return null;
    const value = (daysGroup.value || {}) as Record<string, boolean>;
  
    const labels: Record<string, string> = {
      mon: 'Mon',
      tue: 'Tue',
      wed: 'Wed',
      thu: 'Thu',
      fri: 'Fri',
      sat: 'Sat',
      sun: 'Sun'
    };
  
    const selected = Object.entries(value)
      .filter(([key, isSelected]) => !!isSelected && labels[key])
      .map(([key]) => labels[key]);
  
    if (!selected.length) return null;
    return selected.join(', ');
  }

  private getOrdinalSuffix(day: number): string {
    const j = day % 10,
      k = day % 100;
  
    if (j === 1 && k !== 11) {
      return `${day}st`;
    }
    if (j === 2 && k !== 12) {
      return `${day}nd`;
    }
    if (j === 3 && k !== 13) {
      return `${day}rd`;
    }
    return `${day}th`;
  }
}
