import { Component, HostListener, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Group, Schedule, Subject, SchedulesInfo } from '../../../interfaces';
import { ScheduleItem } from './schedule-item';
import { CommonModule } from '@angular/common';
import { ScheduleService } from '../schedule.service';
import { BehaviorSubject } from 'rxjs';


export interface Item{
  group: Group;
  subject: Subject;
  startTime: Date;
  endTime: Date;
  hall: string;
  getStartTime(): Date;
  getEndTime(): Date;
  getHeight(): Height;
}

export interface Height {
  position: number;
  height: number;
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
  @Input() schedulesInfoInput: SchedulesInfo[] | undefined;

  isMobile: boolean;

  constructor (private scheduleService: ScheduleService) {
    this.isMobile = window.innerWidth <= 768;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }
  
  private checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }

  getDayDisplay(day: number): string {
    const dayString = this.days[day];
    return this.isMobile ? dayString.slice(0, 2) : dayString;
  }
  
  ngOnInit(): void {
    if (this.schedulesInfoInput) {
      this.schedulesInfo = this.schedulesInfoInput;
      this.populateItems();
    } else {
      this.scheduleService.scheduleInfo$.subscribe({
        next: (schedulesInfo) => {
          this.schedulesInfo = schedulesInfo;
          this.populateItems();
        }
      });
    }
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
        hall: scheduleInfo.schedule.hall
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

  
  capitalize(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }



}
