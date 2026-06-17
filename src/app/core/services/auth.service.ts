import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Authority {
  authority: string;
}

export interface User {
  username: string;
  nome?: string;
  equipe?: string;
  authorities: Authority[];
  password?: string | null;
  accountNonExpired?: boolean;
  accountNonLocked?: boolean;
  credentialsNonExpired?: boolean;
  enabled?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly USER_KEY = 'auth_user';
  private platformId = inject(PLATFORM_ID);
  private user = signal<User | null>(this.getUserFromSession());
  private loading = signal<boolean>(false);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  readonly currentUser = computed(() => this.user());
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isLoading = computed(() => this.loading());

  constructor(private http: HttpClient) {}

  private getUserFromSession(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = sessionStorage.getItem(this.USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  }

  private saveSession(user: User) {
    this.user.set(user);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  hasRole(role: string): boolean {
    const user = this.user();
    if (!user) return false;
    // O backend retorna 'ROLE_ADMIN', então verificamos se a authority bate
    return user.authorities.some(a => a.authority === role || a.authority === `ROLE_${role}`);
  }

  login(credentials: { username: string; password: string }) {
    this.loading.set(true);

    const body = new HttpParams()
      .set('username', credentials.username)
      .set('password', credentials.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<User>(`${this.apiUrl}/login`, body.toString(), { headers }).pipe(
      tap(user => {
        this.saveSession(user);
        this.loading.set(false);
      }),
      catchError(err => {
        this.loading.set(false);
        throw err;
      })
    );
  }

  logout() {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearLocalSession()),
      catchError(() => {
        this.clearLocalSession();
        return of(null);
      })
    );
  }

  clearLocalSession() {
    this.user.set(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.USER_KEY);
      localStorage.removeItem('XSRF-TOKEN');
    }
  }

  checkSession() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.saveSession(user)),
      catchError(() => {
        this.clearLocalSession();
        return of(null);
      })
    );
  }
}
