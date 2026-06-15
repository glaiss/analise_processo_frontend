import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';
export interface Authority {
  authority: string;
}

export interface User {
  username: string;
  nome: string;
  equipe?: string;
  authorities: Authority[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = signal<User | null>(null);
  // ... (mantém o resto do código)

  hasRole(role: string): boolean {
    const user = this.user();
    if (!user) return false;
    // O backend retorna 'ROLE_ADMIN', então verificamos se a authority bate
    return user.authorities.some(a => a.authority === role || a.authority === `ROLE_${role}`);
  }
// ...

  private loading = signal<boolean>(false);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  readonly currentUser = computed(() => this.user());
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isLoading = computed(() => this.loading());

  constructor(private http: HttpClient) {}

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
        this.user.set(user);
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
  }

  checkSession() {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap(user => this.user.set(user)),
      catchError(() => {
        this.user.set(null);
        return of(null);
      })
    );
  }


}
