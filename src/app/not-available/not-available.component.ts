import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-available',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './not-available.component.html',
  styleUrl: './not-available.component.css'
})
export class NotAvailableComponent {

}
