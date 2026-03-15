import { NgFor, NgIf, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Logo } from '../logo/logo';
import { LoginService } from '../../services/auth/login.service';
import { NavLink } from '../../services/auth/models/auth.models';

// Importações do PrimeNG
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    Logo,
    ButtonModule,
    RippleModule,
    AvatarModule,
    TooltipModule
  ],
  template: `
    <aside
      class="flex h-screen flex-col border-r border-orange-100 bg-white transition-all duration-300 shadow-sm"
      [class.w-72]="!isCollapsed"
      [class.w-20]="isCollapsed"
    >
      <div class="flex h-20 items-center justify-between border-b border-orange-100 p-4">
        <app-logo *ngIf="!isCollapsed" class="fadein animation-duration-300"></app-logo>
        <p-button
          [icon]="isCollapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"
          (onClick)="toggleSidebar()"
          [rounded]="true"
          [text]="true"
          severity="secondary"
          [class.mx-auto]="isCollapsed"
          pTooltip="{{ isCollapsed ? 'Expandir menu' : 'Recolher menu' }}"
          tooltipPosition="right"
        ></p-button>
      </div>

      <div *ngIf="userName && !isCollapsed" class="p-4 fadein animation-duration-300">
        <div class="flex flex-col items-center rounded-xl border border-orange-100 bg-orange-50/50 p-4 text-center">
          <p-avatar icon="pi pi-user" styleClass="bg-orange-200 text-orange-700" size="large" shape="circle"></p-avatar>
          <p class="mt-3 text-base font-semibold text-secondary">{{ userName }}</p>
          <p class="text-sm text-secondary/80">{{ clinicName }}</p>
          <span class="mt-3 inline-block rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-secondary">
            {{ roleLabel }}
          </span>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-3 py-4">
        <nav class="flex flex-col gap-2">
          <a
            *ngFor="let link of links"
            [routerLink]="link.path"
            routerLinkActive="bg-orange-100 text-orange-700 font-bold border-orange-200"
            class="p-ripple flex items-center rounded-xl px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-orange-50"
            [class.justify-center]="isCollapsed"
            [class.gap-3]="!isCollapsed"
            pTooltip="{{ isCollapsed ? link.label : '' }}"
            tooltipPosition="right"
          >
            <i [class]="link.icon + ' text-lg'"></i>
            <span *ngIf="!isCollapsed" class="fadein animation-duration-200">{{ link.label }}</span>
          </a>
        </nav>
      </div>

      <div class="border-t border-orange-100 p-4">
        <p-button
          [label]="!isCollapsed ? (isLoggingOut ? 'Saindo...' : 'Sair') : ''"
          icon="pi pi-sign-out"
          (onClick)="logout()"
          [loading]="isLoggingOut"
          styleClass="w-full justify-center"
          [rounded]="true"
          [outlined]="true"
          severity="danger"
          pTooltip="{{ isCollapsed ? 'Sair' : '' }}"
          tooltipPosition="right"
        ></p-button>
      </div>
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
    if (this.isLoggingOut) return;

    this.isLoggingOut = true;
    this.loginService.logout().subscribe({
      next: () => this.router.navigateByUrl('/login'),
      complete: () => (this.isLoggingOut = false)
    });
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  private getRoleLabel(role?: string): string {
    const roles: Record<string, string> = {
      'admin': 'Administrador',
      'vet': 'Veterinário(a)',
      'recepcionista': 'Recepcionista'
    };
    return role ? (roles[role] ?? '') : '';
  }
}