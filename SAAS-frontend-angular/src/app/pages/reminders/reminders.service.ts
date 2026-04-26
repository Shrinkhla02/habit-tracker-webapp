import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RemindersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}
  
  getAllHabitsByUserId(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/habits/user/${userId}`);
  }

  updateHabitReminderTime(habitId: string, date: string, time: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/habits/${habitId}/reminder-time`, { date, time });
  }
}
