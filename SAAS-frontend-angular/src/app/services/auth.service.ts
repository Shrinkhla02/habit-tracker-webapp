import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AuthUser {
  _id: string;
  userId?: string;
  name: string;
  email: string;
  isPro?: boolean;
  subscriptionPlan?: 'basic' | 'premium' | 'pro';
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface ProfileResponse {
  user: AuthUser;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly storageKey = 'betterme-auth';
  private readonly currentUserSubject = new BehaviorSubject<AuthResponse | null>(
    this.restoreSession()
  );

  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/login`, credentials, { withCredentials: true })
      .pipe(
        tap((response) => this.persistSession(response)),
        catchError((error) => this.handleError(error, 'Login failed'))
      );
  }

  register(payload: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/register`, payload, { withCredentials: true })
      .pipe(
        tap((response) => this.persistSession(response)),
        catchError((error) => this.handleError(error, 'Registration failed'))
      );
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http
      .get<ProfileResponse>(`${this.baseUrl}/profile`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        withCredentials: true
      })
      .pipe(
        catchError((error) => this.handleError(error, 'Failed to load profile'))
      );
  }

  updateProfile(payload: { password?: string; subscriptionPlan?: 'basic' | 'premium' | 'pro' })
    : Observable<ProfileResponse> {
    return this.http
      .put<ProfileResponse>(`${this.baseUrl}/profile`, payload, {
        headers: {
          Authorization: `Bearer ${this.token}`
        },
        withCredentials: true
      })
      .pipe(
        tap((response) => {
          // Update local session user if plan changed
          const session = this.currentUserSubject.value;
          if (session) {
            this.persistSession({
              ...session,
              user: { ...session.user, ...response.user }
            });
          }
        }),
        catchError((error) => this.handleError(error, 'Failed to update profile'))
      );
  }

  logout(): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
  }

  get currentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return this.currentUserSubject.value?.token ?? null;
  }

  get userId(): string | null {
    const session = this.currentUserSubject.value;
    if (!session) {
      return null;
    }
    return session.user.userId ?? session.user._id ?? null;
  }

  get userPlan(): 'basic' | 'premium' | 'pro' {
    const session = this.currentUserSubject.value;
    if (!session) {
      return 'basic';
    }
    // Check if user has isPro flag or subscriptionPlan
    if (session.user.isPro) {
      return 'pro';
    }
    return session.user.subscriptionPlan ?? 'basic';
  }

  get habitLimit(): number {
    const plan = this.userPlan;
    switch (plan) {
      case 'basic':
        return 3;
      case 'premium':
        return 10;
      case 'pro':
        return -1; // unlimited
      default:
        return 3;
    }
  }

  private persistSession(response: AuthResponse): void {
    localStorage.setItem(this.storageKey, JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  private restoreSession(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? (JSON.parse(raw) as AuthResponse) : null;
    } catch (error) {
      console.warn('Unable to parse saved session', error);
      return null;
    }
  }

  private handleError(error: HttpErrorResponse, fallbackMessage: string) {
    console.error('[AuthService] request failed', error);
    const message =
      error.error?.message ||
      error.message ||
      fallbackMessage ||
      'Something went wrong. Please try again.';
    return throwError(() => new Error(message));
  }
}