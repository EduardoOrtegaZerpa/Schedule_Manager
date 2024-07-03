import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Degree, Subject } from '../../../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css', '../childs.css']
})
export class SubjectsComponent {
  degreeSelect: Degree | undefined;
  subjectSelect: Subject | undefined;
  subjects: Subject[] = [];
  degrees: Degree[] = [];

  subjectName: string = '';
  subjectYear: number | null = null;
  subjectAcronym: string = '';
  subjectSemester: number | null = null;

  subjectForm: FormGroup;
  formInvalid: boolean = false;

  constructor(private fb: FormBuilder) {
    this.subjectForm = this.fb.group({
      subjectName: ['', Validators.required],
      subjectYear: ['', Validators.required],
      subjectAcronym: ['', Validators.required],
      subjectSemester: ['', [Validators.required, Validators.min(1), Validators.max(2)]]
    });
  }
}
