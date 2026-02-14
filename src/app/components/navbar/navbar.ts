import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../logo/logo';
import { AuthService } from '../../auth/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgFor, Logo],
  template: `
    <nav class="bg-gray-900 text-white p-4 flex items-center justify-between">
      <app-logo></app-logo>

      <div class="flex gap-4">
        <a *ngFor="let link of links"
           [routerLink]="link.path"
           class="hover:underline">
          {{ link.label }}
        </a>
      </div>
    </nav>
  `
})
export class Navbar {
  links:any = [];

  constructor(private auth: AuthService) {
    this.links = this.auth.getLinks();
  }
}

