import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private logged = false;
  private role: 'admin' | 'user' | null = null;

  login(role: 'admin' | 'user') {
    this.logged = true;
    this.role = role;
  }

  logout() {
    this.logged = false;
    this.role = null;
  }

  isLogged() {
    return this.logged;
  }

  getLinks() {
    if (!this.logged) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Register', path: '/register' }
      ];
    }

    if (this.role === 'admin') {
      return [
        { label: 'Dashboard', path: '/admin' },
        { label: 'Usuários', path: '/admin/users' }
      ];
    }

    return [
      { label: 'Perfil', path: '/profile' }
    ];
  }
}

