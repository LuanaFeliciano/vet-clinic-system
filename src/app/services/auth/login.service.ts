import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_ENDPOINTS } from '../api/api.config';
import { AuthSession, AuthUser, LoginBody, LoginResponse, NavLink, UserRole } from './models/auth.models';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private readonly sessionStorageKey = 'vetclinic.auth.session';
  private readonly roleLinks: Record<UserRole, NavLink[]> = {
    admin: [
      { label: 'Dashboard', path: '/panel/dashboard', icon: 'pi pi-chart-line' },
      { label: 'Usuários', path: '/panel/users', icon: 'pi pi-users' }
    ],
    vet: [
      { label: 'Dashboard', path: '/panel/dashboard', icon: 'pi pi-chart-line' }
    ],
    recepcionista: [
      { label: 'Dashboard', path: '/panel/dashboard', icon: 'pi pi-chart-line' }
    ]
  };
  private session: AuthSession | null = null;

  constructor(private readonly apiService: ApiService) {
    this.restoreSession();
  }

  login(body: LoginBody): Observable<LoginResponse> {
    return this.apiService
      .post<LoginResponse>(API_ENDPOINTS.login, body)
      .pipe(tap((response) => this.setSession(response)));
  }

  logout(): Observable<void> {
    return this.apiService
      .post<{ message: string }>(API_ENDPOINTS.logout, {})
      .pipe(
        map(() => undefined),
        catchError(() => of(undefined)),
        tap(() => this.clearSession())
      );
  }

  isLoggedIn(): boolean {
    return Boolean(this.session?.token);
  }

  getUser(): AuthUser | null {
    return this.session?.user ?? null;
  }

  getToken(): string | null {
    return this.session?.token ?? null;
  }

  getCurrentRole(): UserRole | null {
    return this.session?.user.role ?? null;
  }

  isEmailVerified(): boolean {
    return Boolean(this.session?.user.email_verified_at);
  }

  resendVerificationEmail(): Observable<string> {
    return this.apiService
      .post<{ message?: string }>(API_ENDPOINTS.resendVerificationEmail, {})
      .pipe(map((response) => response.message ?? 'E-mail de verificação reenviado com sucesso.'));
  }

  refreshAuthenticatedUser(): Observable<AuthUser | null> {
    if (!this.getToken()) {
      return of(null);
    }

    return this.apiService
      .get<AuthUser>(API_ENDPOINTS.me)
      .pipe(
        tap((user) => this.updateSessionUser(user)),
        catchError(() => of(null))
      );
  }

  getPanelLinks(): NavLink[] {
    const role = this.getCurrentRole();

    if (!role) {
      return [];
    }

    return this.roleLinks[role];
  }

  getDefaultPanelRoute(): string {
    const firstAllowedLink = this.getPanelLinks()[0];
    return firstAllowedLink?.path ?? '/panel/dashboard';
  }

  private setSession(payload: LoginResponse): void {
    this.session = {
      user: payload.user,
      token: payload.token
    };

    localStorage.setItem(this.sessionStorageKey, JSON.stringify(this.session));
  }

  private restoreSession(): void {
    const rawSession = localStorage.getItem(this.sessionStorageKey);

    if (!rawSession) {
      return;
    }

    try {
      const parsedSession = JSON.parse(rawSession) as AuthSession;

      if (!parsedSession?.user?.role || !parsedSession.token) {
        this.clearSession();
        return;
      }

      this.session = parsedSession;
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    this.session = null;
    localStorage.removeItem(this.sessionStorageKey);
  }

  private updateSessionUser(user: AuthUser): void {
    if (!this.session) {
      return;
    }

    this.session = {
      ...this.session,
      user
    };

    localStorage.setItem(this.sessionStorageKey, JSON.stringify(this.session));
  }
}
