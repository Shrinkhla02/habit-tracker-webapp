import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface HabitLog {
  _id?: string;
  habitId: string;
  userId: string;
  completedDate: string;
  isCompleted: boolean;
  duration?: number;
  difficulty?: string;
  mood?: string;
  energyLevel?: number;
  notes?: string;
}

interface HabitLogResponse {
  success: boolean;
  data: HabitLog;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HabitLogsService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  /**
   * Create a habit log (mark habit as complete for a date)
   */
  createHabitLog(payload: Partial<HabitLog>): Observable<HabitLog> {
    const userId = this.authService.userId;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    const body = {
      habitId: payload.habitId,
      userId: userId,
      completedDate: payload.completedDate || new Date().toISOString(),
      isCompleted: payload.isCompleted ?? true,
      duration: payload.duration || 0,
      difficulty: payload.difficulty,
      mood: payload.mood,
      energyLevel: payload.energyLevel,
      notes: payload.notes
    };

    return this.http
      .post<HabitLogResponse>(`${this.baseUrl}/habitLogs`, body, {
        withCredentials: true
      })
      .pipe(
        map((response) => response.data),
        catchError((error) => this.handleError(error, 'Failed to mark habit as complete'))
      );
  }

  /**
   * Get all logs for a specific habit
   */
  getHabitLogs(habitId: string): Observable<HabitLog[]> {
    return this.http
      .get<{ success: boolean; data: HabitLog[] }>(`${this.baseUrl}/habitLogs/habit/${habitId}`, {
        withCredentials: true
      })
      .pipe(
        map((response) => response.data ?? []),
        catchError((error) => this.handleError(error, 'Failed to load habit logs'))
      );
  }

  private handleError(error: HttpErrorResponse, fallbackMessage: string): Observable<never> {
    console.error('[HabitLogsService] request failed', error);
    const message =
      error.error?.message ||
      error.message ||
      fallbackMessage ||
      'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}
 