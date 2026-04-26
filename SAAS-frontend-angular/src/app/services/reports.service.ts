import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, forkJoin, throwError, map, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { HabitsService, HabitSummary } from './habits.service';

export interface HabitLog {
  _id: string;
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

interface HabitLogCollectionResponse {
  success: boolean;
  count?: number;
  data: HabitLog[];
}

export interface ReportStats {
  completionRate: number;
  averageStreak: number;
  totalCompleted: number;
  totalHabits: number;
  momentumTimeline: { day: string; value: number }[];
  cadenceBreakdown: { label: string; value: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService
  ) {}

  getReports(): Observable<ReportStats> {
    const userId = this.authService.userId;
    if (!userId) {
      return throwError(() => new Error('User not authenticated'));
    }

    // Fetch habits first
    const habits$ = this.http.get<{ success: boolean; data: HabitSummary[] }>(
      `${this.baseUrl}/habits/user/${userId}`,
      { withCredentials: true }
    );

    // Fetch all logs (we'll filter by habitId)
    const logs$ = this.http.get<HabitLogCollectionResponse>(
      `${this.baseUrl}/habitLogs`,
      { withCredentials: true }
    ).pipe(
      map(response => response.data || []),
      catchError(() => []) // Return empty array if error
    );

    return forkJoin({ habits: habits$, logs: logs$ }).pipe(
      map(({ habits, logs }) => {
        console.log('Fetched habits:', habits);
        console.log('Fetched logs:', logs);
        const habitData = habits.data || [];
        const habitIds = habitData.map(h => h._id);
        console.log('Habit IDs:', habitIds);
        
        // Filter logs to only include those for user's habits
        // Handle both string and ObjectId formats
        const relevantLogs = logs.filter(log => {
          const logHabitId = String(log.habitId);
          return habitIds.some(id => String(id) === logHabitId);
        });
        console.log('Relevant logs:', relevantLogs);
        const stats = this.calculateStats(habitData, relevantLogs);
        console.log('Calculated stats:', stats);
        return stats;
      }),
      catchError((error) => {
        console.error('Error in getReports:', error);
        return this.handleError(error, 'Failed to load reports');
      })
    );
  }

  private calculateStats(habits: HabitSummary[], logs: HabitLog[]): ReportStats {
    const activeHabits = habits.filter(h => h.isActive !== false);
    const totalHabits = activeHabits.length;

    // Filter logs for active habits and completed ones
    const habitIds = activeHabits.map(h => h._id);
    const relevantLogs = logs.filter(log => 
      habitIds.includes(log.habitId) && log.isCompleted
    );

    const totalCompleted = relevantLogs.length;

    // Calculate completion rate (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = relevantLogs.filter(log => 
      new Date(log.completedDate) >= sevenDaysAgo
    );
    const expectedCompletions = totalHabits * 7; // Assuming daily habits
    const completionRate = expectedCompletions > 0 
      ? Math.round((recentLogs.length / expectedCompletions) * 100) 
      : 0;

    // Calculate average streak
    const streaks = activeHabits.map(habit => {
      const habitLogs = relevantLogs
        .filter(log => log.habitId === habit._id)
        .map(log => new Date(log.completedDate))
        .sort((a, b) => b.getTime() - a.getTime());

      if (habitLogs.length === 0) return 0;

      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < habitLogs.length; i++) {
        const logDate = new Date(habitLogs[i]);
        logDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (i === 0 && daysDiff === 0) {
          currentStreak = 1;
        } else if (i === 0 && daysDiff === 1) {
          currentStreak = 1;
        } else if (i > 0) {
          const prevDate = new Date(habitLogs[i - 1]);
          prevDate.setHours(0, 0, 0, 0);
          const daysBetween = Math.floor((prevDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
          if (daysBetween === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
      }

      return currentStreak;
    });

    const averageStreak = streaks.length > 0
      ? Math.round((streaks.reduce((a, b) => a + b, 0) / streaks.length) * 10) / 10
      : 0;

    // Calculate momentum timeline (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const momentumTimeline = [];
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - i);
      targetDate.setHours(0, 0, 0, 0);
      
      const dayName = days[targetDate.getDay()];
      
      // Filter all logs for this specific date (not just recentLogs)
      const dayLogs = relevantLogs.filter(log => {
        const logDate = new Date(log.completedDate);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === targetDate.getTime();
      });

      // Calculate percentage based on completed vs expected
      const value = totalHabits > 0 ? Math.round((dayLogs.length / totalHabits) * 100) : 0;
      momentumTimeline.push({ day: dayName, value });
    }

    // Calculate cadence breakdown
    const cadenceCounts: Record<string, number> = {
      'Daily': 0,
      'Weekly': 0,
      'Bi-weekly': 0,
      'Custom': 0
    };

    activeHabits.forEach(habit => {
      const freq = habit.frequency?.toLowerCase() || 'daily';
      if (freq === 'daily') {
        cadenceCounts['Daily']++;
      } else if (freq === 'weekly') {
        cadenceCounts['Weekly']++;
      } else {
        cadenceCounts['Custom']++;
      }
    });

    const totalCadence = Object.values(cadenceCounts).reduce((a, b) => a + b, 0);
    const cadenceBreakdown = Object.entries(cadenceCounts).map(([label, count]) => ({
      label,
      value: totalCadence > 0 ? Math.round((count / totalCadence) * 100) : 0
    }));

    return {
      completionRate,
      averageStreak,
      totalCompleted,
      totalHabits,
      momentumTimeline,
      cadenceBreakdown
    };
  }

  private handleError(error: HttpErrorResponse, fallbackMessage: string) {
    console.error('[ReportsService] request failed', error);
    const message =
      error.error?.message ||
      error.message ||
      fallbackMessage ||
      'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}

