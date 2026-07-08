import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { tap, catchError, map } from 'rxjs/operators';
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
  private readonly IMPERSONATION_KEY = 'impersonating_origin';
  private platformId = inject(PLATFORM_ID);
  private user = signal<User | null>(this.getFromSession(this.USER_KEY));
  private impersonatingOrigin = signal<string | null>(this.getFromSession(this.IMPERSONATION_KEY));
  private loading = signal<boolean>(false);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  readonly currentUser = computed(() => this.user());
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isLoading = computed(() => this.loading());
  readonly isImpersonating = computed(() => !!this.impersonatingOrigin());
  readonly impersonatingAdmin = computed(() => this.impersonatingOrigin());

  constructor(private http: HttpClient) {}

  private getFromSession(key: string): any {
    if (isPlatformBrowser(this.platformId)) {
      const stored = sessionStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  }

  private setInSession(key: string, value: any) {
    if (isPlatformBrowser(this.platformId)) {
      if (value === null) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    }
  }

  private saveSession(user: User) {
    this.user.set(user);
    this.setInSession(this.USER_KEY, user);
  }

  hasRole(role: string): boolean {
    const user = this.user();
    if (!user) return false;
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
    this.impersonatingOrigin.set(null);
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.IMPERSONATION_KEY);
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

  checkImpersonation() {
    return this.http.get<{ origin: string } | null>(`${this.apiUrl}/impersonating-origin`).pipe(
      tap(result => {
        if (result && result.origin) {
          this.impersonatingOrigin.set(result.origin);
          this.setInSession(this.IMPERSONATION_KEY, result.origin);
        } else {
          this.impersonatingOrigin.set(null);
          this.setInSession(this.IMPERSONATION_KEY, null);
        }
      }),
      catchError(() => {
        return of(null);
      })
    );
  }

  impersonate(targetEmail: string) {
    return this.http.post<User>(`${this.apiUrl}/impersonate`, { targetEmail }).pipe(
      tap(user => {
        this.saveSession(user);
        this.checkImpersonation().subscribe();
      })
    );
  }

  stopImpersonating() {
    return this.http.post<User>(`${this.apiUrl}/stop-impersonating`, {}).pipe(
      tap(user => {
        if (user) {
          this.saveSession(user);
          this.impersonatingOrigin.set(null);
          this.setInSession(this.IMPERSONATION_KEY, null);
        } else {
          this.clearLocalSession();
        }
      })
    );
  }

  alterarSenha(senhaAtual: string, senhaNova: string) {
    return this.http.put(`${this.apiUrl}/senha`, { senhaAtual, senhaNova });
  }
}
