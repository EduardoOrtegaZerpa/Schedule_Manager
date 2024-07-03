import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-card',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-card.component.html',
  styleUrl: './admin-card.component.css'
})
export class AdminCardComponent {
  
  @Input() title: string | undefined;
  @Input() path: string | undefined;

  constructor(private router: Router) {}

  navigate() {
    this.router.navigate([this.path]);
  }

  isActiveRoute(): boolean {
    return this.router.url === this.path;
  }
}
