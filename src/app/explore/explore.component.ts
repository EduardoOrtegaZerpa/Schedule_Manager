import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Degree, Group, SchedulesInfo, Subject } from '../../interfaces';
import { ScheduleComponent } from '../schedule/schedule.component';
import { ScheduleService } from '../schedule/schedule.service';
import { UserService } from '../user.service';
import { EMPTY, forkJoin } from 'rxjs';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent],
  templateUrl: './explore.component.html',
  styleUrl: './explore.component.css'
})
export class ExploreComponent implements OnInit{

  constructor(private scheduleService: ScheduleService, private userService: UserService) {}

  degrees: Degree[] = [];
  years: number[] = [];
  semesters: number[] = [];

  degreeSelect: Degree | undefined;
  yearSelect: number | undefined;
  semesterSelect: number | undefined;

  schedulesInfo: SchedulesInfo[] = [];

  subjects: Subject[] = [];
  groups: Group[] = [];
  

  ngOnInit(): void {
    this.scheduleService.setScheduleInfo([]);
    this.loadDegreesWithSubjectsAndGroups();
  }

  setSemester(semester: number | undefined) {
    if (semester) {
      this.semesterSelect = semester;
    }
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
      },
      error: error => this.handleSubjectError(error)
    });
  }

  onDegreeChange(degree: Degree | undefined) {
    if (degree) {
        this.schedulesInfo = [];

        this.degreeSelect = degree;

        this.years = Array.from({ length: degree.years }, (_, i) => i + 1);
        this.yearSelect = this.years[0];

        const uniqueSemesters = new Set(this.subjects.map(subject => subject.semester));
        this.semesters = Array.from(uniqueSemesters);  
        this.semesterSelect = this.semesters[0];

        this.loadSchedulesInfo();
    }
}

  onYearChange(year: number | undefined) {
    if (year) {
      this.yearSelect = year;
      this.schedulesInfo = [];
      this.loadSchedulesInfo();
    }
  }

  onSemesterChange(semester: number | undefined) {
    if (semester) {
      this.semesterSelect = semester;
      this.schedulesInfo = [];
      this.loadSchedulesInfo();
    }
  }

  shownGroups() {
    const groups = this.groups.filter(group => {
      const subject = this.subjects.find(subject => subject.id === group.subject_id);
      return subject && subject.semester === this.semesterSelect && subject.degree_id === this.degreeSelect?.id && subject.year === this.yearSelect;
    });

    const groupSetByNames = new Set(groups.map(group => group.name));
    return groupSetByNames;
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
          console.log('Processing groups', groups, this.subjects[index]);
          this.processGroups(groups, this.subjects[index]);
        });
        
        if (this.degrees.length > 0) {
          this.onDegreeChange(this.degrees[0]);
        }
      },
      error: error => this.handleGroupError(error)
    });
  }

  onSubjectChange(arg0: Subject) {
    throw new Error('Method not implemented.');
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

  handleScheduleError(error: any) {
    console.error('Error fetching schedules', error);
  }

  loadSchedulesInfo() {
    const subjects = this.subjects.filter(subject => subject.semester === this.semesterSelect && subject.degree_id === this.degreeSelect?.id && subject.year === this.yearSelect);
    const groups = this.groups.filter(group => subjects.some(subject => subject.id === group.subject_id));
    const observables = groups.map(group => {
      if (group.id) {
        return this.userService.getSchedulesByGroupId(group.id);
      }
      return EMPTY;
    });

    forkJoin(observables).subscribe({
      next: (result) => {
        result.forEach((schedules, index) => {
          schedules.forEach(schedule => {
            const subject = subjects.find(subject => subject.id === this.groups[index].subject_id);
            if (!subject) {
              return;
            }
            this.schedulesInfo.push({
              subject: subject,
              group: this.groups[index],
              schedule
            });
          });
        });
      },
      error: error => this.handleScheduleError(error)
    });
  }

  filteredSchedulesInfo(groupName: string) {
    return this.schedulesInfo.filter(scheduleInfo => scheduleInfo.group.name === groupName);
  }

}

