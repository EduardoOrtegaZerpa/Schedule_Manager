import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  loggedIn: boolean = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.loginStatus$().subscribe((status: boolean) => {
      this.loggedIn = status;
    });
  }

}
