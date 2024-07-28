import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ColumnComponent} from './column/column.component';
import {CommonModule} from '@angular/common';
import {UserService} from '../user.service';
import {SchedulesInfo} from '../../interfaces';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [ColumnComponent, CommonModule],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.css'
})
export class ScheduleComponent implements OnInit, OnChanges {

  @Input() trimColumns: boolean = false;
  trimColumnsRange: [number, number] = [0, 24];

  private DAY_HOURS = 24;
  private HOURS_RANGE = 12;
  private HOURS_JUMP = this.DAY_HOURS / this.HOURS_RANGE;

  hours: string[] = [];
  weekDays: string[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  @Input() schedulesInfo: SchedulesInfo[] | undefined;

  ngOnInit(): void {
    this.hours = this.generateHours();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['schedulesInfo']) {
      console.warn("No schedules info available for trimming columns or trimming is disabled.");
      return;
    }

    if (!this.trimColumns) {
      console.warn("Trimming columns is disabled.");
      return
    }

    this.schedulesInfo = changes['schedulesInfo'].currentValue;

    if (!this.schedulesInfo) {
      console.warn("No schedules info available for trimming columns.")
      return;
    }

    const times = this.schedulesInfo.map(item => ({
      startTime: item.schedule.startTime.getHours(),
      endTime: item.schedule.endTime.getHours()
    }));

    const minStartTime = times.reduce((min, t) => Math.min(min, t.startTime), 24);
    const maxEndTime = times.reduce((max, t) => Math.max(max, t.endTime), 0);

    this.trimColumnsRange = [minStartTime, maxEndTime];
  }


  generateHours(): string[] {
    const hours = [];
    if (this.trimColumns){
      this.HOURS_JUMP = 1;
    }
    for (let i = this.trimColumnsRange[0]; i < this.trimColumnsRange[1]; i += this.HOURS_JUMP) {
      hours.push(`${i.toString().padStart(2, '0')}:00`);
    }
    return hours;
  }

}
