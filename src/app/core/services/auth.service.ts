import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  username: string;
  nome: string;
  equipe?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user = signal<User | null>(null);
  private loading = signal<boolean>(false);
  private apiUrl = `${environment.apiUrl}/usuarios`;

  readonly currentUser = computed(() => this.user());
  readonly isAuthenticated = computed(() => !!this.user());
  readonly isLoading = computed(() => this.loading());

  constructor(private http: HttpClient) {}

  login(credentials: { username: string; password: string }) {
    this.loading.set(true);
    return this.http.post<User>(`${this.apiUrl}/login`, credentials).pipe(
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
      tap(() => this.user.set(null))
    );
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
