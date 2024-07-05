import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Degree, Subject } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { CreateSubjectService } from '../../popups/create-subject/create-subject-service.service';
import { AdminService } from '../admin.service';
import { UserService } from '../../user.service';
import { EMPTY, forkJoin } from 'rxjs';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css', '../childs.css']
})
export class SubjectsComponent implements OnInit{
  degreeSelect: Degree | undefined;
  subjectSelect: Subject | undefined;
  subjects: Subject[] = [];
  filteredSubjects: Subject[] = [];
  degrees: Degree[] = [];

  subjectForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private createSubjectService: CreateSubjectService,
    private userService: UserService
  ) {
    this.subjectForm = this.fb.group({
      subjectName: ['', Validators.required],
      subjectYear: ['', Validators.required],
      subjectAcronym: ['', Validators.required],
      subjectSemester: ['', [Validators.required, Validators.min(1), Validators.max(2)]]
    });
  }

  async ngOnInit(): Promise<void> {
    this.loadDegreesWithSubjects();
    this.createSubjectService.created.subscribe((subject: Subject) => {
      this.subjects.push(subject);
      if (this.degreeSelect && subject.degree_id === this.degreeSelect.id) {
        this.onDegreeChange(this.degreeSelect);
      }
    });
  }

  loadDegreesWithSubjects() {
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
      next: results => {
        results.forEach((subjects, index) => {
          this.subjects = this.subjects.concat(subjects);
        });
  
        if (this.degrees.length > 0) {
          this.onDegreeChange(this.degrees[0]);
        }
      },
      error: (error) => this.handleSubjectError(this.degrees[0], error)
    });
  }


  handleDegreeError(error: any) {
    console.error('Error fetching degrees', error);
  }

  handleSubjectError(degree: Degree, error: any) {
    console.error(`No subjects found for degree: ${degree.name}`, error);
  }


  onDegreeChange(Degree: Degree) {
    this.degreeSelect = Degree;
    console.log(this.degreeSelect);
    console.log(this.subjects);
    this.filteredSubjects = this.subjects.filter(subject => subject.degree_id === this.degreeSelect?.id);
    console.log(this.filteredSubjects);
    this.setSubject(this.filteredSubjects[0]);
  }

  onSubjectChange(subject: Subject) {
    this.setSubject(subject);
  }

  onSubjectDeleted(subjectDeleted: Subject) {

    this.subjects = this.subjects.filter(subject => subject.id !== subjectDeleted.id);

    if(this.degreeSelect){
      this.onDegreeChange(this.degreeSelect);
    }

    if (this.subjects.length === 0) {
      const remainingDegrees = this.degrees.filter(degree => this.subjects.some(subject => subject.degree_id === degree.id));

      if (remainingDegrees.length > 0) {
        this.onDegreeChange(remainingDegrees[0]);
      } else {
        this.setSubject(undefined);
      }
    }
  }

  onSubjectUpdated(subjectUpdated: Subject) {
    this.subjects = this.subjects.map(subject => {
      if (subject.id === subjectUpdated.id) {
        return subjectUpdated;
      }
      return subject;
    });

    this.filteredSubjects = this.subjects.filter(subject => subject.degree_id === this.degreeSelect?.id);
    this.setSubject(subjectUpdated);
  }

  setSubject(subject: Subject | undefined): void {
    if (subject) {
      this.subjectSelect = subject;
      this.setForm(subject);
    } else {
      this.subjectSelect = undefined;
      this.subjectForm.reset();
    }
  }


  setForm(subject: Subject): void {
    this.subjectForm.setValue({
      subjectName: subject.name,
      subjectYear: subject.year,
      subjectAcronym: subject.acronomy,
      subjectSemester: subject.semester
    });
  }

  createSubject(): void {
    if (this.degreeSelect) {
      this.createSubjectService.openCreateSubjectPopup(this.degreeSelect);
    }
  }


  updateSubject(): void {
    if (this.subjectSelect && this.checkIfChanged() && this.degreeSelect && this.degreeSelect.id) {

      const subject: Subject = {
        id: this.subjectSelect.id,
        name: this.subjectForm.value.subjectName,
        year: this.subjectForm.value.subjectYear,
        acronomy: this.subjectForm.value.subjectAcronym,
        semester: this.subjectForm.value.subjectSemester,
        degree_id: this.degreeSelect.id
      };

      this.adminService.updateSubject(subject).subscribe((res: Subject) => {
        this.onSubjectUpdated(res);
      });
    }
  }

  deleteSubject(): void {
    const subject = this.subjectSelect;
    if (subject && subject.id) {
      this.adminService.deleteSubject(subject.id).subscribe(() => {
        this.onSubjectDeleted(subject);
      });
    }
  }

  checkIfChanged(): boolean {
    return this.subjectSelect?.name !== this.subjectForm.value.subjectName ||
    this.subjectSelect?.year !== this.subjectForm.value.subjectYear ||
    this.subjectSelect?.acronomy !== this.subjectForm.value.subjectAcronym ||
    this.subjectSelect?.semester !== this.subjectForm.value.subjectSemester;
  }


}
