import {Group, Schedule, Subject} from "../../../interfaces";
import {Position, Item} from "./column.component";


export class ScheduleItem implements Item {
  group: Group;
  subject: Subject;
  startTime: Date;
  endTime: Date;
  hall: string;

  constructor(schedule: Schedule, group: any, subject: any) {
    this.group = group;
    this.subject = subject;
    this.startTime = new Date(schedule.startTime);
    this.endTime = new Date(schedule.endTime);
    this.hall = schedule.hall;
  }

  getStartTime(): Date {
    return this.startTime;
  }

  getEndTime(): Date {
    return this.endTime;
  }

  getPosition(trimColumnRange: [number, number]): Position {
    if (this.startTime.getHours() === 0 && this.startTime.getMinutes() === 0 &&
      this.endTime.getHours() === 0 && this.endTime.getMinutes() === 0) {
      return {top: 0, height: 100};
    }

    const dayTotalMilliseconds = (trimColumnRange[1] - trimColumnRange[0]) * 1000 * 60 * 60;
    const startTimeMillis = this.startTime.getTime() - (trimColumnRange[0] * 1000 * 60 * 60);
    const endTimeMillis = this.endTime.getTime() - (trimColumnRange[0] * 1000 * 60 * 60);
    const top = (startTimeMillis / dayTotalMilliseconds) * 100;
    const height = ((endTimeMillis - startTimeMillis) / dayTotalMilliseconds) * 100;
    return {top: top, height: height};
  }

}
