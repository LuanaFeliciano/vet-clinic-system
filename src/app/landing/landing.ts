import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-landing',
  imports: [MenubarModule, ButtonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing implements OnInit {
  items: MenuItem[] | undefined;

  constructor(private router: Router) {

  }

  

  ngOnInit() {
    this.items = [
    { label: 'Home', routerLink: '/home' },
    { label: 'Serviços', routerLink: '/servicos' },
    { label: 'Sobre Nós', routerLink: '/sobre' }
  ];
  }
}
