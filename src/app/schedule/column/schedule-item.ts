import { Group, Schedule, Subject } from "../../../interfaces";
import { Height, Item } from "./column.component";


export class ScheduleItem implements Item{
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
  
    getHeight(): Height {
        if (this.startTime.getHours() === 0 && this.startTime.getMinutes() === 0 && this.endTime.getHours() === 0 && this.endTime.getMinutes() === 0){
          return { position: 0, height: 100 };
        }
        const dayTotalMiliseconds = 24 * 1000 * 60 * 60;

        const position = this.startTime.getTime() * 100 / dayTotalMiliseconds;
        const height = (this.endTime.getTime() - this.startTime.getTime()) * 100 / dayTotalMiliseconds;
        return { position, height };
    }
  
  }
  