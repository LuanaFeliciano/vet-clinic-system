import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_ENDPOINTS } from '../api/api.config';
import { PanelUser, UserFormValue, UserUpsertPayload } from './models/users.models';
import { UserRole } from '../auth/models/auth.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private readonly apiService: ApiService) {}

  listUsers(): Observable<PanelUser[]> {
    return this.apiService
      .get<unknown>(API_ENDPOINTS.users)
      .pipe(map((response) => this.extractUsers(response)));
  }

  saveUser(id: number | null, payload: UserUpsertPayload): Observable<unknown> {
    return id
      ? this.apiService.put<unknown>(`${API_ENDPOINTS.users}/${id}`, payload)
      : this.apiService.post<unknown>(API_ENDPOINTS.users, payload);
  }

  deactivateUser(id: number): Observable<string> {
    return this.apiService
      .delete<{ message?: string }>(`${API_ENDPOINTS.users}/${id}`)
      .pipe(map((response) => response?.message ?? 'Colaborador inativado.'));
  }

  restoreUser(id: number): Observable<string> {
    return this.apiService
      .patch<{ message?: string }>(`${API_ENDPOINTS.users}/${id}/restore`, {})
      .pipe(map((response) => response?.message ?? 'Colaborador reativado.'));
  }

  buildPayload(formValue: UserFormValue): UserUpsertPayload {
    const payload: UserUpsertPayload = {
      name: formValue.name.trim(),
      email: formValue.email.trim(),
      role: formValue.role ?? 'vet'
    };

    const password = formValue.password.trim();
    const confirmation = formValue.password_confirmation.trim();

    if (password) {
      payload.password = password;
      payload.password_confirmation = confirmation;
    }

    return payload;
  }

  getRoleLabel(role: UserRole): string {
    if (role === 'admin') {
      return 'Administrador';
    }

    if (role === 'recepcionista') {
      return 'Recepcionista';
    }

    return 'Veterinário(a)';
  }

  getRoleSeverity(role: UserRole) {
    if (role === 'admin') {
      return 'danger';
    }

    if (role === 'recepcionista') {
      return 'secondary';
    }

    return 'info';
  }

  getStatusSeverity(user: PanelUser): 'success' | 'warn' | 'danger' {
    console.log(user);
    if (!user.is_active) {
      return 'danger';
    }

    return user.email_verified_at ? 'success' : 'warn';
  }

  getStatusLabel(user: PanelUser): string {
    if (!user.is_active) {
      return 'Inativo';
    }

    return user.email_verified_at ? 'Ativo' : 'Pendente';
  }

  getInitials(name: string): string {
    const [first = '', second = ''] = name.trim().split(/\s+/);
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }

  private extractUsers(response: unknown): PanelUser[] {
    if (Array.isArray(response)) {
      return this.normalizeUsers(response as PanelUser[]);
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const data = (response as { data?: unknown }).data;

    if (Array.isArray(data)) {
      return this.normalizeUsers(data as PanelUser[]);
    }

    if (data && typeof data === 'object') {
      const nestedData = (data as { data?: unknown }).data;

      if (Array.isArray(nestedData)) {
        return this.normalizeUsers(nestedData as PanelUser[]);
      }
    }

    return [];
  }

  private normalizeUsers(users: PanelUser[]): PanelUser[] {
    return users.map((user) => ({
      ...user,
      is_active: user.is_active ?? true
    }));
  }
}
