import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable, forkJoin, from, map, of } from 'rxjs';
import { Degree, Group, Schedule, Subject } from '../../../interfaces';

interface ScheduleResult {
  hours: {
      startTime: Date | null;
      endTime: Date | null;
  };
  days: boolean[];
  halls: string[];
  id: (Number | null)[];
  group_id: string | null;
}

interface ScheduleRow {
  startTime: string | null;
  endTime: string | null;
}

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css', '../childs.css']
})
export class GroupsComponent {
  degrees: Degree[] = [];
  subjects: Subject[] = [];
  groups: Group[] = [];
  degreeSelect: Degree | undefined;
  subjectSelect: Subject | undefined;
  groupSelect: Group | undefined;
  groupName: string = '';
  groupDetails: string = '';

  days: boolean[] = Array(7).fill(false);

  rows: ScheduleRow[] = [];

  groupForm: FormGroup;

  scheduleResult: ScheduleResult[] = this.rows.map(row => ({
    hours: {startTime: null, endTime: null},
    days: [...this.days],
    id: [],
    group_id: null,
    halls: Array(7).fill('')
  }));

  constructor(private fb: FormBuilder) {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      groupDetails: ['', Validators.required]
    });
  }


  resetScheduleInputs() {
    this.rows = [];
    this.days = [false, false, false, false, false, false, false];
    this.scheduleResult = [];
  }

  //FIXME
  async updateTable(event: any, index: number, dayIndex: number) {
    const {tagName} = event.target;
    const {groupSelect, scheduleResult} = this;

    // if (tagName !== 'TD' || !groupSelect) return;

    if (tagName !== 'TD') return;

    await this.updateRow(event.target.id, index);
  }

  async updateRow(targetId: string, index: number) {
    const dayMapping: { [key: string]: number } = {
      'monday': 0,
      'tuesday': 1,
      'wednesday': 2,
      'thursday': 3,
      'friday': 4,
      'saturday': 5,
      'sunday': 6,
      'default': 7
    };

    const dayIndex = dayMapping[targetId] !== undefined ? dayMapping[targetId] : -1;

    if (dayIndex === -1) return;

    const startTime = this.scheduleResult[index].hours.startTime;
    const endTime = this.scheduleResult[index].hours.endTime;

    if (!this.scheduleResult[index].days[dayIndex] && startTime && endTime) {
      const newSchedule: Schedule = {
        group_id: 3,
        startTime: startTime,
        endTime: endTime,
        day: this.getDayName(dayIndex),
        hall: this.scheduleResult[index].halls[dayIndex]
      };

      //FIXME
      this.createSchedule(newSchedule).subscribe((response: any) => {
        if (response) {
          // this.scheduleResult[index].id[dayIndex] = response.id;
          this.scheduleResult[index].days[dayIndex] = !this.scheduleResult[index].days[dayIndex];
        }
      });
    } else {
      const formattedSchedules = this.formatObject(this.scheduleResult[index]);
      const scheduleToUpdate = formattedSchedules.find((schedule: Schedule) => schedule.day === this.getDayName(dayIndex));
      if (scheduleToUpdate) {
        this.deleteSchedule(scheduleToUpdate).subscribe((response: boolean) => {
          if (response) {
            this.scheduleResult[index].id[dayIndex] = null;
            this.scheduleResult[index].days[dayIndex] = !this.scheduleResult[index].days[dayIndex];
          }
        });
      }
    }
  }

  getDayName(index: number): string {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return daysOfWeek[index];
  }

  getDayIndex(day: string): number {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return daysOfWeek.findIndex((dia: string) => dia === day);
  }

  //FIXME
  createSchedule(schedule: Schedule): Observable<any> {
    const validated = this.validateSchedule(schedule);

    if (validated.result === null) {
      return of(false);
    }

    // return from(this.schedulesService.createSchedule(schedule)).pipe(
    //   map((response: any) => {
    //     if (response.success) {
    //       return response.result;
    //     } else {
    //       return false;
    //     }
    // }));
    return of(true)
  }

  deleteSchedule(schedule: Schedule): Observable<boolean> {
    return of(true);
  }

  putSchedule(schedule: Schedule): Observable<boolean> {
    const validated = this.validateSchedule(schedule);

    if (validated.result === null || !schedule.id) {
      return of(false);
    }

    return of(true);
  }

  updateTime(index: number) {
    const {startTime, endTime} = this.rows[index];
    const startDate = startTime ? new Date(`2000-01-01T${startTime}`) : null;
    const endDate = endTime ? new Date(`2000-01-01T${endTime}`) : null;

    this.scheduleResult[index].hours.startTime = startDate;
    this.scheduleResult[index].hours.endTime = endDate;

    const schedulesToUpdate = this.formatObject(this.scheduleResult[index]);
    schedulesToUpdate.forEach((schedule: Schedule) => {
      if (schedule.id) {
        this.putSchedule(schedule).subscribe();
      } else {
        this.createSchedule(schedule).subscribe();
      }
    });
  }


  onTimeChange(event: any, index: number, isStartTime: boolean) {
    const value = event.target.value;

    const [hora, minutos] = value.split(":").map(Number);
    const fechaActual = new Date();
    fechaActual.setHours(hora);
    fechaActual.setMinutes(minutos);

    if (isStartTime) {
      this.rows[index].startTime = value;
    } else {
      this.rows[index].endTime = value;
    }

    if (this.rows[index].startTime && this.rows[index].endTime) {
      this.updateTime(index);
    }
  }

  addRow() {
    this.rows.push({
      startTime: null,
      endTime: null,
    });

    const newDays = Array(7).fill(false);
    const halls = Array(7).fill('');

    this.scheduleResult.push({
      hours: {startTime: null, endTime: null},
      days: newDays,
      id: [],
      group_id: null,
      halls: halls
    });
  }

  //FIXME
  deleteRow(index: number) {
    const schedulesToDelete = this.scheduleResult[index];
    const schedulesFormatted = this.formatObject(schedulesToDelete);

    if (schedulesFormatted.length === 0) {
      this.scheduleResult.splice(index, 1);
      this.rows.splice(index, 1);
      return;
    }

    const deleteRequests = schedulesFormatted.map((schedule: Schedule) => {
      if (schedule.id) {
        // return this.schedulesService.deleteSchedule(schedule.id);
        return of(true);
      } else {
        return of(false);
      }
    });

    forkJoin(deleteRequests).subscribe((responses: boolean[]) => {
      this.scheduleResult.splice(index, 1);
      this.rows.splice(index, 1);
    });

  }

  private validateSchedule(schedule: Schedule): any {
    if (!schedule.startTime || !schedule.endTime) {
        return { result: null, details: "Please enter a start and end time for each row." };
    }

    let overlapDetected = false;
    this.scheduleResult.forEach((row: ScheduleResult) => {
        row.days.forEach((dia: boolean, index: number) => {
            if (!row.id.find(id => id === schedule.id) && dia) {
              console.log("start time schedule: " + schedule.startTime, "start time row: " + row.hours.startTime)
              console.log("end time schedule: " + schedule.endTime, "end time row: " + row.hours.endTime)
              if (
                schedule.day === this.getDayName(index) &&
                dia &&
                row.hours.startTime !== null &&
                row.hours.endTime !== null &&
              (
                (
                  (schedule.startTime >= row.hours.startTime && schedule.startTime <= row.hours.endTime) ||
                  (schedule.endTime >= row.hours.startTime && schedule.endTime <= row.hours.endTime)
                ) ||
                (
                  (row.hours.startTime >= schedule.startTime && row.hours.startTime <= schedule.endTime) ||
                  (row.hours.endTime >= schedule.startTime && row.hours.endTime <= schedule.endTime)
                )
              )
              ) {
                overlapDetected = true;
              }
            }
        });
    });

    if (overlapDetected) {
        return { result: null, details: "The schedule overlaps with an existing one." };
    } else {
        return { result: schedule, details: "Successfully validated horarios." };
    }
  }

  //FIXME
  private formatObject(scheduleResult: ScheduleResult): Schedule[] {
    const formattedSchedules: Schedule[] = [];
    const startTime = scheduleResult.hours.startTime;
    const endTime = scheduleResult.hours.endTime;
    const group_id = scheduleResult.group_id;

    if (startTime && endTime) {
      scheduleResult.days.forEach((dia: boolean, index: number) => {
        if (dia) {
          formattedSchedules.push({
            id: scheduleResult.id[index] || undefined,
            group_id: 3,
            startTime: startTime,
            endTime: endTime,
            day: this.getDayName(index),
            hall: scheduleResult.halls[index]
          });
        }
      });
    }
    return formattedSchedules;
  }


}
