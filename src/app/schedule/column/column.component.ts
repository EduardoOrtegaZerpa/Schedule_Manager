import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Group, Schedule, Subject } from '../../../interfaces';
import { SchedulesInfo } from '../schedule.component';
import { ScheduleItem } from './schedule-item';
import { CommonModule } from '@angular/common';

export interface Item{
  group: Group;
  subject: Subject;
  startTime: Date;
  endTime: Date;
  hall: string;
  getStartTime(): Date;
  getEndTime(): Date;
  getHeight(): number;
}

@Component({
  selector: 'app-column',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './column.component.html',
  styleUrl: './column.component.css'
})
export class ColumnComponent implements OnInit, OnChanges{

  days: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  @Input() day: number = 0;
  items: Item[] = [];
  schedulesInfo: SchedulesInfo[] = [];
  
  ngOnInit(): void {

  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['day']) {
      this.day = changes['day'].currentValue;
      this.populateItems();
    }
  }

  getWeekNameFromIndex(index: number): string{
    return this.days[index];
  }

  private convertToUnixTime(date: Date): Date {
    const epoch = new Date(0);
    epoch.setUTCHours(date.getHours(), date.getMinutes(), 0, 0);
    return epoch
  }

  populateItems(){
    this.items = [];
    this.schedulesInfo
    .filter(scheduleInfo => scheduleInfo.schedule.day === this.getWeekNameFromIndex(this.day))
    .forEach(scheduleInfo => {

      const convertedSchedule: Schedule = {
        ...scheduleInfo.schedule,
        startTime: this.convertToUnixTime(new Date(scheduleInfo.schedule.startTime)),
        endTime: this.convertToUnixTime(new Date(scheduleInfo.schedule.endTime)),
      }

      this.items.push(new ScheduleItem(convertedSchedule, scheduleInfo.group, scheduleInfo.subject));


    });

    this.sortItems();
  }

  sortItems(){
    this.items.sort((a, b) => {
      if (a.getStartTime() < b.getStartTime()) {
        return -1;
      }
      if (a.getStartTime() > b.getStartTime()) {
        return 1;
      }
      return 0;
    });
  }


}
