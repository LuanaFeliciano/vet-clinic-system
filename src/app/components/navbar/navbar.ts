import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Logo } from '../logo/logo';
import { LoginService } from '../../services/auth/login.service';
import { NavLink } from '../../services/auth/models/auth.models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgFor, NgIf, Logo],
  template: `
    <aside
      class="h-screen border-r border-orange-100 bg-white p-4 transition-all duration-200"
      [class.w-72]="!isCollapsed"
      [class.w-20]="isCollapsed"
    >
      <div class="relative flex items-center border-b border-orange-100 pb-4" [class.justify-between]="!isCollapsed">
        <app-logo *ngIf="!isCollapsed"></app-logo>
        <button
          type="button"
          (click)="toggleSidebar()"
          class="rounded-lg border border-orange-200 text-secondary hover:bg-orange-50"
          [class.ml-auto]="!isCollapsed"
          [class.mx-auto]="isCollapsed"
          [class.h-9]="true"
          [class.w-9]="true"
          [class.flex]="true"
          [class.items-center]="true"
          [class.justify-center]="true"
          [attr.aria-label]="isCollapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <i [class]="isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
        </button>
      </div>

      <section *ngIf="userName && !isCollapsed" class="mt-6 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
        <p class="text-xs font-semibold uppercase tracking-widest text-secondary/70">Perfil ativo</p>
        <p class="mt-2 text-base font-semibold text-secondary">{{ userName }}</p>
        <p class="text-sm text-secondary/80">{{ clinicName }}</p>
        <span class="mt-3 inline-block rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-secondary">
          {{ roleLabel }}
        </span>
      </section>

      <nav class="mt-6 space-y-2">
        <a
          *ngFor="let link of links"
          [routerLink]="link.path"
          routerLinkActive="bg-orange-100 text-secondary border border-orange-200"
          class="flex items-center rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50/70"
          [class.gap-3]="!isCollapsed"
          [class.justify-center]="isCollapsed"
          [attr.title]="isCollapsed ? link.label : null"
        >
          <i [class]="link.icon"></i>
          <span *ngIf="!isCollapsed">{{ link.label }}</span>
        </a>
      </nav>

      <button
        type="button"
        (click)="logout()"
        [disabled]="isLoggingOut"
        class="mt-8 w-full rounded-xl border border-orange-200 px-4 py-2 text-sm font-semibold text-secondary transition hover:bg-orange-50"
        [class.px-2]="isCollapsed"
        [attr.title]="isCollapsed ? 'Sair' : null"
      >
        <span *ngIf="!isCollapsed">{{ isLoggingOut ? 'Saindo...' : 'Sair' }}</span>
        <i *ngIf="isCollapsed" class="pi pi-sign-out"></i>
      </button>
    </aside>
  `
})
export class Navbar {
  readonly links: NavLink[];
  readonly userName: string;
  readonly clinicName: string;
  readonly roleLabel: string;
  isLoggingOut = false;
  isCollapsed = false;

  constructor(
    private readonly loginService: LoginService,
    private readonly router: Router
  ) {
    const currentUser = this.loginService.getUser();

    this.links = this.loginService.getPanelLinks();
    this.userName = currentUser?.name ?? '';
    this.clinicName = currentUser?.clinic?.name ?? '';
    this.roleLabel = this.getRoleLabel(currentUser?.role);
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.loginService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/login');
      },
      complete: () => {
        this.isLoggingOut = false;
      }
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private getRoleLabel(role?: string): string {
    if (role === 'admin') {
      return 'Administrador';
    }

    if (role === 'vet') {
      return 'Veterinário(a)';
    }

    if (role === 'recepcionista') {
      return 'Recepcionista';
    }

    return '';
  }
}
