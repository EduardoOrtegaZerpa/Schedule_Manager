import { Component } from '@angular/core';
import { Degree, Subject } from '../../interfaces';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';
import { EMPTY, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  degrees: Degree[] = [];
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  selectedDegree: number | null = null;
  selectedYears: { [degreeId: number]: number[] } = {};
  selectedSubjects: Subject[] = [];
  filterTerm: string = '';


  constructor(private userService: UserService) {
    this.loadDegreesWithSubjects();
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

  resetSubjects() {
    this.selectedSubjects = [];
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

  applyFilter() {
    const filterValue = this.filterTerm.toLowerCase().trim();
    this.filteredSubjects = this.subjects.filter(subject => subject.name.toLowerCase().includes(filterValue));
  }

  clearFilter() {
    this.filterTerm = '';
    this.filteredSubjects = this.subjects;
  }
}
