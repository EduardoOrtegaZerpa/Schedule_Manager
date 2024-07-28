import { Component, OnInit } from '@angular/core';
import { Degree, Subject, SchedulesInfo, AlgorithmResponse } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { EMPTY, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { ScheduleComponent } from '../schedule/schedule.component';
import { ScheduleService } from '../schedule/schedule.service';
import { NotificationService } from '../notification/notification.service';


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
  selectedYears: { [degreeId: number]: number | null } = {};
  selectedSubjects: Subject[] = [];
  filterTerm: string = '';
  selectedSemester: number = 1;
  firstSemesterSchedulesInfo: SchedulesInfo[] = [];
  secondSemesterSchedulesInfo: SchedulesInfo[] = [];
  firstSemesterResponse: AlgorithmResponse | null = null;
  secondSemesterResponse: AlgorithmResponse | null = null;
  isOverlapping: boolean[] = [true, false];

  private weekHours: number = 24 * 7;


  constructor(
    private userService: UserService,
    private notificationService: NotificationService,
    private scheduleService: ScheduleService) {
    this.loadDegreesWithSubjects();
  }

  ngOnInit(): void {
    this.scheduleService.setScheduleInfo([]);
    console.log(this.isOverlapping);
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
    if (this.selectedYears[degreeId] === year) {
      this.selectedYears[degreeId] = null;
      return;
    }
    this.selectedYears[degreeId] = year;
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
    this.isOverlapping = [false, false];
    this.selectedSubjects = [];
    this.firstSemesterResponse = null;
    this.secondSemesterResponse = null
    this.firstSemesterSchedulesInfo = [];
    this.secondSemesterSchedulesInfo = [];
    this.scheduleService.setScheduleInfo([]);
  }

  isYearSelected(degreeId: number, year: number): boolean {
    return this.selectedYears[degreeId] === year
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
    this.notificationService.show('Error fetching degrees');
  }

  handleSubjectError(degree: Degree, error: any) {
    console.error(`No subjects found for degree: ${degree.name}`, error);
    this.notificationService.show(`No subjects found for degree: ${degree.name}`);
  }

  handleScheduleError(error: any) {
    console.error('Error fetching schedule', error);
    this.notificationService.show('Error fetching schedule');
  }

  handleConversionError(error: any) {
    console.error('Error converting response', error);
    this.notificationService.show('Error converting response');
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
    if (this.selectedSemester === 1) {
      return this.firstSemesterSchedulesInfo;
    } else {
      return this.secondSemesterSchedulesInfo;
    } 
  }

  generateScheduleBySemester(semester: number) {
    const subjects = this.selectedSubjects.filter(subject => subject.semester === semester);
    const subjectsId: number[] = subjects.map(subject => subject.id!);
    this.userService.generateNoConflictSchedules(subjectsId).subscribe({
      next: (algorithmResponse: AlgorithmResponse) => {
        this.showSchedule(algorithmResponse, semester);
        if (semester === 1) {
          this.firstSemesterResponse = algorithmResponse;
        } else {
          this.secondSemesterResponse = algorithmResponse;
        }
      },
      error: (error) => this.handleScheduleError(error)
    });
  }

  generateSchedule() {
    this.isOverlapping = [false, false];
    this.generateScheduleBySemester(1);
    this.generateScheduleBySemester(2);
  }

  getOccupiedHours(semester: number) {
    const response = semester === 1 ? this.firstSemesterResponse : this.secondSemesterResponse;

    if (!response ) {
      return 0;
    }

    return this.weekHours - response.hours === 168 ? 0 : this.weekHours - response.hours;
  }

  getFreeHours(semester: number) {
    const response = semester === 1 ? this.firstSemesterResponse : this.secondSemesterResponse;

    if (!response) {
      return 0;
    }

    return response.hours;
  }

  getFreeDays(semester: number) {
    const response = semester === 1 ? this.firstSemesterResponse : this.secondSemesterResponse;
    if (!response) {
      return 0;
    }

    return response.days;
  }

  generateLessOptimalSchedule() {
    this.generateLessOptimalScheduleBySemester(this.selectedSemester);
  }

  generateLessOptimalScheduleBySemester(semester: number) {
    const scheduleInfo = this.filterScheduleInfo();
    const subjects = scheduleInfo.map(schedule => schedule.subject);
    const subjectsId: number[] = subjects.map(subject => subject.id!);
    const freeDays = this.getFreeDays(semester);
    const freeHours = this.getFreeHours(semester);
    this.userService.generateLessOptimalSchedules(subjectsId, freeDays, freeHours).subscribe({
      next: (algorithmResponse: AlgorithmResponse) => {
        this.showSchedule(algorithmResponse, semester);
        if (semester === 1) {
          this.firstSemesterResponse = algorithmResponse;
        } else {
          this.secondSemesterResponse = algorithmResponse;
        }
      },
      error: (error) => this.handleScheduleError(error)
    });
  }

  showSchedule(algorithmResponse: AlgorithmResponse, semester: number) {
    
    if (algorithmResponse.subjects.length === 0) {

        if (semester === 1) {
            this.firstSemesterSchedulesInfo = [];
            this.isOverlapping[0] = true;
        } else {
            this.secondSemesterSchedulesInfo = [];
            this.isOverlapping[1] = true;
        }

        if (this.selectedSemester === semester) {
            this.scheduleService.setScheduleInfo([]);
        }
        
        //FIXME: show error messages and change calendar for text
        // this.notificationService.show('No schedules found');
        
        return;
    }
    
    this.userService.convertResponseToScheduleInfo(algorithmResponse).subscribe({
        next: (schedulesInfo: SchedulesInfo[]) => {
            if (semester === 1) {
                this.firstSemesterSchedulesInfo = schedulesInfo;
            } else {
                this.secondSemesterSchedulesInfo = schedulesInfo;
            }
            this.scheduleService.setScheduleInfo(this.filterScheduleInfo());
        },
        error: (error) => this.handleConversionError(error)
    });
}


  showScheduleInfo() {
    const filteredScheduleInfo = this.filterScheduleInfo();
    const uniqueScheduleInfo: SchedulesInfo[] = [];
    const seenSubjects = new Set();

    filteredScheduleInfo.forEach(scheduleInfo => {
        if (scheduleInfo.subject.name && !seenSubjects.has(scheduleInfo.subject.name)) {
            seenSubjects.add(scheduleInfo.subject.name);
            uniqueScheduleInfo.push(scheduleInfo);
        }
    });

    return uniqueScheduleInfo;
}

}


