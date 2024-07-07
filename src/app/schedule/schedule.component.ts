import { Component, input, Input, OnInit } from '@angular/core';
import { ColumnComponent } from './column/column.component';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { SchedulesInfo } from '../../interfaces';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [ColumnComponent, CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit{

  private DAY_HOURS = 24;
  private HOURS_RANGE = 12;
  private HOURS_JUMP = this.DAY_HOURS / this.HOURS_RANGE;

  constructor(private userService: UserService) { }

  hours: string[] = [];
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  @Input() schedulesInfo: SchedulesInfo[] | undefined;

  ngOnInit(): void {
    this.hours = this.generateHours();
  }

  generateHours(): string[] {
    const hours = [];
    for (let i = 0; i < this.DAY_HOURS; i += this.HOURS_JUMP) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return hours;
  }

}
