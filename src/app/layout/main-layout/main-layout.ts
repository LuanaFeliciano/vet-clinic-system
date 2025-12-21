import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Logo } from '../../components/logo/logo';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, Logo],
  template: `
    <header class="p-4">
      <app-logo></app-logo>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `
})
export class MainLayout {}
