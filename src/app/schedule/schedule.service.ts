import { Injectable } from '@angular/core';
import { SchedulesInfo } from '../../interfaces';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private scheduleInfoSubject = new BehaviorSubject<SchedulesInfo[]>([]);
  scheduleInfo$ = this.scheduleInfoSubject.asObservable();

  setScheduleInfo(schedulesInfo: SchedulesInfo[]): void {
    this.scheduleInfoSubject.next(schedulesInfo);
  }
}
