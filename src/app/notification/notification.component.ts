import { Component, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css'
})
export class NotificationComponent implements OnInit {

  isShown: boolean = false;
  message: string = '';
  animateOut: boolean = false;

  constructor(private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.notificationService.isNotificationShown().subscribe(isShown => {
      if (isShown) {
        this.isShown = true;
        this.animateOut = false;
        setTimeout(() => {
          this.animateOut = true;
          setTimeout(() => {
            this.isShown = false;
            this.animateOut = false;
          }, 500);
        }, 3000);
      }
    });

    this.notificationService.getNotificationMessage().subscribe(message => {
      this.message = message;
    });
  }

  close() {
    this.notificationService.hide();
  }

}