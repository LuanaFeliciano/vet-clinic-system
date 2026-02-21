import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { LoginService } from '../../services/auth/login.service';

@Component({
  selector: 'app-panel-layout',
  standalone: true,
  imports: [RouterOutlet, Navbar, NgIf],
  template: `
    <div class="panel-bg flex min-h-screen">
      <app-navbar></app-navbar>

      <main class="flex-1 p-6 lg:p-10">
        <section
          *ngIf="showEmailVerificationAlert"
          class="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4"
        >
          <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p class="text-sm font-semibold text-amber-900">E-mail não verificado</p>
              <p class="text-sm text-amber-800/90">
                Verifique seu e-mail para liberar as funcionalidades protegidas da plataforma.
              </p>
              <p *ngIf="emailVerificationMessage" class="mt-1 text-xs font-medium text-amber-900">
                {{ emailVerificationMessage }}
              </p>
            </div>

            <button
              type="button"
              (click)="resendVerificationEmail()"
              [disabled]="isResendingVerificationEmail"
              class="btn btn-sm border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            >
              {{ isResendingVerificationEmail ? 'Enviando...' : 'Reenviar e-mail' }}
            </button>
          </div>
        </section>

        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class PanelLayout {
  showEmailVerificationAlert = false;
  isResendingVerificationEmail = false;
  emailVerificationMessage: string | null = null;

  constructor(private readonly loginService: LoginService) {
    this.refreshEmailVerificationState();
  }

  resendVerificationEmail(): void {
    if (this.isResendingVerificationEmail) {
      return;
    }

    this.isResendingVerificationEmail = true;
    this.emailVerificationMessage = null;

    this.loginService.resendVerificationEmail().subscribe({
      next: (message) => {
        this.emailVerificationMessage = message;
      },
      error: () => {
        this.emailVerificationMessage = 'Não foi possível reenviar agora. Tente novamente.';
      },
      complete: () => {
        this.isResendingVerificationEmail = false;
      }
    });
  }

  private refreshEmailVerificationState(): void {
    this.showEmailVerificationAlert = !this.loginService.isEmailVerified();

    this.loginService.refreshAuthenticatedUser().subscribe({
      next: (user) => {
        if (!user) {
          return;
        }

        this.showEmailVerificationAlert = !Boolean(user.email_verified_at);
      }
    });
  }
}
