import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMPTY, Observable, catchError, forkJoin, from, map, of } from 'rxjs';
import { Degree, Group, Schedule, Subject } from '../../../interfaces';
import { CreateGroupService } from '../../popups/create-group/create-group-service.service';
import { UserService } from '../../user.service';
import { AdminService } from '../admin.service';

interface ScheduleResult {
  hours: {
      startTime: Date | null;
      endTime: Date | null;
  };
  days: boolean[];
  halls: string[];
  id: (number | undefined)[];
  group_id: number | undefined;
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
export class GroupsComponent implements OnInit{
  degrees: Degree[] = [];
  subjects: Subject[] = [];
  groups: Group[] = [];
  degreeSelect: Degree | undefined;
  subjectSelect: Subject | undefined;
  groupSelect: Group | undefined;
  filteredGroups: Group[] = [];
  filteredSubjects: Subject[] = [];


  days: boolean[] = Array(7).fill(false);
  rows: ScheduleRow[] = [];
  groupForm: FormGroup;

  scheduleResult: ScheduleResult[] = this.rows.map(row => ({
    hours: {startTime: null, endTime: null},
    days: [...this.days],
    id: [],
    group_id: undefined,
    halls: Array(7).fill('')
  }));

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private createGroupService: CreateGroupService,
    private userService: UserService,
  ) {
    this.groupForm = this.fb.group({
      groupName: ['', Validators.required],
      groupDetails: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadDegreesWithSubjectsAndGroups();
    this.createGroupService.created.subscribe((group: Group) => {
      this.groups.push(group);
      if (this.subjectSelect && group.subject_id === this.subjectSelect.id) {
        this.onSubjectChange(this.subjectSelect);
      }
    });
  }

  loadDegreesWithSubjectsAndGroups() {
    this.userService.getAllDegrees().subscribe({
      next: (degrees) => this.processDegrees(degrees),
      error: (error) => this.handleDegreeError(error)
    });
  }

  processDegrees(degrees: Degree[]) {
    
    const observables = degrees.map(degree => {
      if (degree.id) {
        this.degrees.push(degree);
        return this.userService.getSubjectsByDegreeId(degree.id);
      }
      return EMPTY;
    });

    forkJoin(observables).subscribe({
      next: (result) => {
        result.forEach((subjects, index) => {
          this.processSubjects(subjects, this.degrees[index]);
        });

        if (this.degrees.length > 0) {
          this.onDegreeChange(this.degrees[0]);
        }
      },
      error: error => this.handleSubjectError(error)
    });
  }

  processSubjects(subjects: Subject[], degree: Degree) {
    const observables = subjects.map(subject => {
      if (subject.id) {
        this.subjects.push(subject);
        return this.userService.getGroupsBySubjectId(subject.id);
      }
      return EMPTY;
    });

    forkJoin(observables).subscribe({
      next: (result) => {
        result.forEach((groups, index) => {
          this.processGroups(groups, this.subjects[index]);
        });

        if (this.subjects.length > 0) {
          this.onSubjectChange(this.subjects[0]);
        }
      },
      error: error => this.handleGroupError(error)
    });
  }

  processGroups(groups: Group[], subject: Subject) {
    if (subject.id) {
      this.groups = this.groups.concat(groups);
    }
  }

  handleDegreeError(error: any) {
    console.error('Error fetching degrees', error);
  }

  handleSubjectError(error: any) {
    console.error('Error fetching subjects', error);
  }

  handleGroupError(error: any) {
    console.error('Error fetching groups', error);
  }

  onDegreeChange(degree: Degree) {
    this.degreeSelect = degree;
    this.filteredSubjects = this.subjects.filter(subject => subject.degree_id === this.degreeSelect?.id);
    this.setSubject(this.filteredSubjects[0]);
  }

  onSubjectChange(subject: Subject) {
    this.setSubject(subject);
  }

  onGroupChange(group: Group) {
    this.setGroup(group);
  }

  onGroupUpdated(group: Group) {
    this.groups = this.groups.map((groupItem: Group) => {
      if (groupItem.id === group.id) {
        return group;
      }
      return groupItem;
    });

    this.filteredGroups = this.groups.filter(group => group.subject_id === this.subjectSelect?.id);
    this.setGroup(group);
  }

  onGroupDeleted(groupDeleted: Group) {
    this.groups = this.groups.filter(group => group.id !== groupDeleted.id);

    if (this.subjectSelect) {
      this.onSubjectChange(this.subjectSelect);
    }

    if (this.groups.length === 0) {
      const remainingSubjects = this.subjects.filter(subject => this.groups.some(group => group.subject_id === subject.id));

      if (remainingSubjects.length > 0) {
        this.onSubjectChange(remainingSubjects[0]);
      } else {
        this.setSubject(undefined);
      }
    }
  }

  setSubject(subject: Subject | undefined) {
    if (subject) {
      this.subjectSelect = subject;
      this.filteredGroups = this.groups.filter(group => group.subject_id === this.subjectSelect?.id);
      this.setGroup(this.filteredGroups[0]);
    } else {
      this.setGroup(undefined);
      this.groupForm.reset();
    }
  }

  async setGroup(group: Group | undefined) {
    if (group) {
      this.groupSelect = group;
      this.setFormValues();
      await this.loadSchedules();
    }else{
      this.groupSelect = undefined;
      this.groupForm.reset();
      this.resetScheduleInputs();
    }
  }

  setFormValues() {
    this.groupForm.setValue({
      groupName: this.groupSelect?.name || '',
      groupDetails: this.groupSelect?.details || ''
    });
  }

  createGroup() {
    if (this.degreeSelect && this.subjectSelect) {
      this.createGroupService.openCreateGroupPopup(this.degreeSelect, this.subjectSelect);
    }
  }

  saveSchedule(rowIndex: number, dayIndex: number) {
    const schedule = this.formatObject(this.scheduleResult[rowIndex]).find(schedule =>
      schedule.day === this.getDayName(dayIndex)
    );
    if (schedule) {
      const hallName = schedule.hall;
      this.putSchedule(schedule).subscribe(
        (response: boolean) => {
          if (response) {
            this.scheduleResult[rowIndex].halls[dayIndex] = hallName;
          }
        }
      );
    }
  }

  updateGroup() {
    if (this.groupSelect && this.checkIfChanges() && this.subjectSelect && this.degreeSelect && this.degreeSelect.id && this.subjectSelect.id) {

      const group: Group = {
        id: this.groupSelect.id,
        name: this.groupForm.value.groupName,
        details: this.groupForm.value.groupDetails,
        subject_id: this.subjectSelect.id,
        degree_id: this.degreeSelect.id
      };

      this.adminService.updateGroup(group).subscribe((response: any) => {
        this.onGroupUpdated(response);
      });
    }
  }

  deleteGroup() {
    const group = this.groupSelect;
    if (group && group.id) {
      this.adminService.deleteGroup(group.id).subscribe(() => {
          this.onGroupDeleted(group);
      });
    }
  }

  checkIfChanges() {
    if (this.groupSelect) {
      const {groupName, groupDetails} = this.groupForm.value;
      return this.groupSelect.name !== groupName || (this.groupSelect.details !== groupDetails || ( groupDetails !== '' && !this.groupSelect.details));
    }
    return false;
  }


  resetScheduleInputs() {
    this.rows = [];
    this.days = [false, false, false, false, false, false, false];
    this.scheduleResult = [];
  }

  async updateTable(event: any, index: number, dayIndex: number) {
    const {tagName} = event.target;
    const {groupSelect, scheduleResult} = this;

    if (tagName !== 'TD' || !groupSelect) return;

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

    if(!this.groupSelect || !this.groupSelect.id) return;

    const startTime = this.scheduleResult[index].hours.startTime;
    const endTime = this.scheduleResult[index].hours.endTime;

    if (!this.scheduleResult[index].days[dayIndex] && startTime && endTime) {
      const newSchedule: Schedule = {
        group_id: this.groupSelect?.id,
        startTime: startTime,
        endTime: endTime,
        day: this.getDayName(dayIndex),
        hall: this.scheduleResult[index].halls[dayIndex]
      };

      this.createSchedule(newSchedule).subscribe((response: any) => {
        if (response) {
          this.scheduleResult[index].id[dayIndex] = response.id;
          this.scheduleResult[index].days[dayIndex] = !this.scheduleResult[index].days[dayIndex];
          this.scheduleResult[index].halls[dayIndex] = response.hall;
        }
      });
    } else {
      const formattedSchedules = this.formatObject(this.scheduleResult[index]);
      const scheduleToUpdate = formattedSchedules.find((schedule: Schedule) => schedule.day === this.getDayName(dayIndex));
      if (scheduleToUpdate) {
        this.deleteSchedule(scheduleToUpdate).subscribe((response: boolean) => {
          if (response) {
            this.scheduleResult[index].id[dayIndex] = undefined;
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

  createSchedule(schedule: Schedule): Observable<any> {
    const validated = this.validateSchedule(schedule);

    if (validated.result === null) {
      console.error(validated.details);
      return of(false);
    }

    return from(this.adminService.addSchedule(schedule, schedule.group_id)).pipe(
      map((response: any) => {
        if (response) {
          return response;
        } else {
          window.location.reload();
          return false;
        }
    }));
  }

  deleteSchedule(schedule: Schedule): Observable<boolean> {
    if (!schedule.id) {
      return of(false);
    }

    return from(this.adminService.deleteSchedule(schedule.id)).pipe(
      map((response: any) => {
        if (response) {
          return true;
        } else {
          window.location.reload();
          return false;
        }
    }));
  }

  putSchedule(schedule: Schedule): Observable<boolean> {
    const validated = this.validateSchedule(schedule);

    if (validated.result === null || !schedule.id) {
      return of(false);
    }

    return from(this.adminService.updateSchedule(schedule)).pipe(
      map((response: any) => {
        if (response) {
          return true;
        } else {
          window.location.reload();
          return false;
        }
    }));
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


  async onTimeChange(event: any, index: number, isStartTime: boolean) {
    const value = event.target.value;

    const currentStart = this.rows[index].startTime ? new Date(`2000-01-01T${this.rows[index].startTime}`) : null;
    const currentEnd = this.rows[index].endTime ? new Date(`2000-01-01T${this.rows[index].endTime}`) : null;

    const newStart = isStartTime ? new Date(`2000-01-01T${value}`) : currentStart;
    const newEnd = !isStartTime ? new Date(`2000-01-01T${value}`) : currentEnd;

    if (newStart && newEnd && this.checkValidDates(newStart, newEnd) === false) {
      this.deleteRow(index);
      return;
    }

    if (newStart && newEnd) {
      this.removeOverlappingSchedules(index, newStart, newEnd);
    }

    if (isStartTime) {
      this.rows[index].startTime = value;
    } else {
      this.rows[index].endTime = value;
    }

    if (this.rows[index].startTime && this.rows[index].endTime) {
      this.updateTime(index);
    }

  }

  onHallChange(event: any, rowIndex: number, dayIndex: number) {
    this.scheduleResult[rowIndex].halls[dayIndex] = event;
    this.checkIfChanges();
  }

  removeOverlappingSchedules(originalIndex: number, newStart: Date, newEnd: Date) {
    this.scheduleResult.forEach((row, rowIndex) => {
      if (rowIndex !== originalIndex) {
        row.days.forEach((dia, dayIndex) => {
          if (dia && row.hours.startTime && row.hours.endTime && this.checkOverlap(row.hours.startTime, row.hours.endTime, newStart, newEnd)) {
            this.scheduleResult[rowIndex].days.forEach((dia, index) => {
              if (dia) {
                this.removeSchedule(originalIndex, index);
              }
            });
          }
        });
      }
    });
  }
  
  checkOverlap(start: Date, end: Date, newStart: Date, newEnd: Date): boolean {
    return (
      (start && end && newStart && newEnd) &&
      (
        (newStart >= start && newStart <= end) ||
        (newEnd >= start && newEnd <= end) ||
        (start >= newStart && start <= newEnd) ||
        (end >= newStart && end <= newEnd)
      )
    );
  }
  
  removeSchedule(rowIndex: number, dayIndex: number) {
    const scheduleToDelete = this.formatObject(this.scheduleResult[rowIndex]).find(
      (schedule: Schedule) => schedule.day === this.getDayName(dayIndex)
    );
    if (scheduleToDelete) {
      this.deleteSchedule(scheduleToDelete).subscribe(
        (response: boolean) => {
          if (response) {
            this.scheduleResult[rowIndex].id[dayIndex] = undefined;
            this.scheduleResult[rowIndex].days[dayIndex] = false;
          }
        }
      );
    }
  }

  checkValidDates(start: Date, end: Date): boolean {
    return start < end;
  }

  checkIfDatesOverlap(startTime: Date, endTime: Date) {
    const schedules = this.scheduleResult.filter(schedule => schedule.hours.startTime !== startTime && schedule.hours.endTime !== endTime);
    const overlapDetected = schedules.some(schedule => {
      const start = schedule.hours.startTime;
      const end = schedule.hours.endTime;

      if (start && end) {
        return this.checkOverlap(start, end, startTime, endTime);
      }
      return false;
    });

    return overlapDetected;

  }

  async getSchedules(): Promise<any> {
    try {
      if (this.groupSelect && this.groupSelect.id) {
        const schedules = await this.userService.getSchedulesByGroupId(this.groupSelect.id).toPromise();
        return schedules
      } else {
        return [];
      }
    } catch (error) {
      return [];
    }
  }

  async loadSchedules() {
    this.resetScheduleInputs();

    const schedulesObject: any = await this.getSchedules();

    const schedules: Schedule[] = schedulesObject;

    if (!this.groupSelect || !this.groupSelect.id){
      console.error('No group selected');
      return;
    } 


    schedules.forEach(schedule => {
      const startTime = new Date(schedule.startTime);
      const endTime = new Date(schedule.endTime);
      const startTimeString = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
      const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
      const id = schedule.id;
      const dayIndex = this.getDayIndex(schedule.day.toLowerCase())

      if (!this.scheduleResult.some(row => row.hours.startTime?.getHours() === startTime.getHours() && row.hours.endTime?.getHours() === endTime.getHours() &&
        row.hours.startTime?.getMinutes() === startTime.getMinutes() && row.hours.endTime?.getMinutes() === endTime.getMinutes())) {
        this.scheduleResult.push({
          hours: {startTime, endTime},
          days: Array(7).fill(false),
          id: Array(7).fill(undefined),
          group_id: this.groupSelect?.id,
          halls: Array(7).fill('')
        });
      }

      if (!this.rows.some(row => row.startTime === startTimeString && row.endTime === endTimeString)) {
        this.rows.push({startTime: startTimeString, endTime: endTimeString});
      }

      if (dayIndex !== -1) {
        const resultIndex = this.scheduleResult.findIndex(row => row.hours.startTime?.getHours() === startTime.getHours() && row.hours.endTime?.getHours() === endTime.getHours() &&
          row.hours.startTime?.getMinutes() === startTime.getMinutes() && row.hours.endTime?.getMinutes() === endTime.getMinutes());
        this.scheduleResult[resultIndex].days[dayIndex] = true;
        this.scheduleResult[resultIndex].id[dayIndex] = id;
        this.scheduleResult[resultIndex].halls[dayIndex] = schedule.hall;
      }
    });
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
      group_id: this.groupSelect?.id,
      halls: halls
    });
  }


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
        this.adminService.deleteSchedule(schedule.id).subscribe();
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
            if (
              schedule.day === this.getDayName(index) &&
              dia &&
              row.hours.startTime !== null &&
              row.hours.endTime !== null &&
              this.checkOverlap(schedule.startTime, schedule.endTime, row.hours.startTime, row.hours.endTime)
            ) {
              console.log(schedule.startTime, schedule.endTime, row.hours.startTime, row.hours.endTime)
              console.log(schedule.day, this.getDayName(index));
              overlapDetected = true;
            }
          }
      })
    });

    if (overlapDetected) {
        return { result: null, details: "The schedule overlaps with an existing one." };
    } else {
        return { result: schedule, details: "Successfully validated horarios." };
    }
  }

  areSchedulesHallsEqual(currentSchedules: ScheduleResult[], originalSchedules: Schedule[]): boolean {
    if (currentSchedules.length !== originalSchedules.length) {
      return false;
    }

    for (let i = 0; i < currentSchedules.length; i++) {
      const current = currentSchedules[i];
      const original = originalSchedules[i];

      if (current.halls.some((hall, index) => hall !== original.hall)) {
        return false;
      }
    }

    return true;
  }

  private formatObject(scheduleResult: ScheduleResult): Schedule[] {
    const formattedSchedules: Schedule[] = [];
    const startTime = scheduleResult.hours.startTime;
    const endTime = scheduleResult.hours.endTime;
    const group_id = scheduleResult.group_id;
    
    if (startTime && endTime && group_id) {
      scheduleResult.days.forEach((dia: boolean, index: number) => {
        if (dia) {
          formattedSchedules.push({
            id: scheduleResult.id[index] || undefined,
            group_id: group_id,
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
