import { Component, OnInit } from '@angular/core';
import { Degree, Subject, SchedulesInfo, AlgorithmResponse } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { EMPTY, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ScheduleComponent } from '../schedule/schedule.component';
import { ScheduleService } from '../schedule/schedule.service';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, ScheduleComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{

  degrees: Degree[] = [];
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  selectedDegree: number | null = null;
  selectedYears: { [degreeId: number]: number[] } = {};
  selectedSubjects: Subject[] = [];
  filterTerm: string = '';
  selectedSemester: number = 1;
  schedulesInfo: SchedulesInfo[] = [];
  daysFree: number = 0;
  hoursFree: number = 0;

  private weekHours: number = 24 * 7;


  constructor(private userService: UserService, private scheduleService: ScheduleService) {
    this.loadDegreesWithSubjects();
  }

  ngOnInit(): void {
    this.scheduleService.setScheduleInfo([]);
  }

  loadDegreesWithSubjects() {
    this.userService.getAllDegrees().subscribe({
      next: (degrees) => this.processDegrees(degrees),
      error: (error) => this.handleDegreeError(error)
    });
  }

  processDegrees(degrees: Degree[]) {
    const degreesWithSubjects: Degree[] = [];
    const observables = degrees.map(degree => {
      if (degree.id) {
        return this.userService.getSubjectsByDegreeId(degree.id);
      }
      return EMPTY;
    });
  
    forkJoin(observables).subscribe({
      next: results => {
        results.forEach((subjects, index) => {
          this.subjects = this.subjects.concat(subjects);
          if (subjects.length > 0) {
            degreesWithSubjects.push(degrees[index]);
          }
        });
        this.degrees = degreesWithSubjects;
        this.filteredSubjects = this.subjects;
      },
      error: (error) => this.handleSubjectError(this.degrees[0], error)
    });
  }
  

  toggleDegree(degreeId: number) {
    if (this.selectedDegree === degreeId) {
      this.selectedDegree = null;
    } else {
      this.selectedDegree = degreeId;
    }
  }

  toggleYear(degreeId: number, year: number) {
    if (!this.selectedYears[degreeId]) {
      this.selectedYears[degreeId] = [];
    }

    const index = this.selectedYears[degreeId].indexOf(year);
    if (index > -1) {
      this.selectedYears[degreeId].splice(index, 1);
    } else {
      this.selectedYears[degreeId].push(year);
    }
  }

  toggleSubject(subject: Subject) {
    const index = this.selectedSubjects.indexOf(subject);
    if (index > -1) {
      this.selectedSubjects.splice(index, 1);
    } else {
      this.selectedSubjects.push(subject);
    }
  }

  switchSemester(semester: number) {
    if (this.selectedSemester === semester) {
      return;
    }
    this.selectedSemester = semester;
    this.scheduleService.setScheduleInfo(this.filterScheduleInfo());
  }

  reset() {
    this.selectedSubjects = [];
    this.daysFree = 0;
    this.hoursFree = 0;
    this.schedulesInfo = [];
    this.scheduleService.setScheduleInfo([]);
  }

  isYearSelected(degreeId: number, year: number): boolean {
    return this.selectedYears[degreeId]?.includes(year);
  }

  isSubjectSelected(subject: Subject): boolean {
    return this.selectedSubjects.includes(subject);
  }

  getYears(degreeId: number): number[] {
    const yearsWithSubjects = [...new Set(this.filteredSubjects
      .filter(subject => subject.degree_id === degreeId)
      .map(subject => subject.year)
    )];

    return yearsWithSubjects;
  }

  getSubjects(degreeId: number, year: number): Subject[] {
    return this.filteredSubjects.filter(subject => subject.degree_id === degreeId && subject.year === year);
  }

  getSubjectClass(subject: Subject): string {
    return this.isSubjectSelected(subject) ? 'selected' : 'non-selected';
  }

  handleDegreeError(error: any) {
    console.error('Error fetching degrees', error);
  }

  handleSubjectError(degree: Degree, error: any) {
    console.error(`No subjects found for degree: ${degree.name}`, error);
  }

  handleScheduleError(error: any) {
    console.error('Error fetching schedule', error);
  }

  handleConversionError(error: any) {
    console.error('Error converting response', error);
  }

  applyFilter() {
    const filterValue = this.filterTerm.toLowerCase().trim();
    this.filteredSubjects = this.subjects.filter(subject => subject.name.toLowerCase().includes(filterValue));
  }

  clearFilter() {
    this.filterTerm = '';
    this.filteredSubjects = this.subjects;
  }

  filterScheduleInfo() {
    return this.schedulesInfo.filter(scheduleInfo => scheduleInfo.subject.semester === this.selectedSemester);
  }

  generateSchedule() {

    const subjectsId: number[] = this.selectedSubjects.map(subject => subject.id!);
    this.userService.generateNoConflictSchedules(subjectsId).subscribe({
      next: (algorithmResponse: AlgorithmResponse) => {
        this.showSchedule(algorithmResponse);
        this.daysFree = algorithmResponse.days;
        this.hoursFree = (this.weekHours - algorithmResponse.hours) > 0 ? this.weekHours - algorithmResponse.hours : 0;
      },
      error: (error) => this.handleScheduleError(error)
    });
  }

  showSchedule(algorithmResponse: AlgorithmResponse) {
    this.userService.convertResponseToScheduleInfo(algorithmResponse).subscribe({
      next: (schedulesInfo: SchedulesInfo[]) => {
        this.schedulesInfo = schedulesInfo;
        this.scheduleService.setScheduleInfo(this.filterScheduleInfo());
      },
      error: (error) => this.handleConversionError(error)
    });
  }
}
