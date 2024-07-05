import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Degree, Subject } from '../../../interfaces';
import { CreateSubjectService } from './create-subject-service.service';
import { AdminService } from '../../admin/admin.service';

@Component({
  selector: 'app-create-subject',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-subject.component.html',
  styleUrls: ['./create-subject.component.css', '../popup-common.css']
})
export class CreateSubjectComponent implements OnInit{

  subjectForm: FormGroup;
  degree: Degree | undefined;

  constructor(private fb: FormBuilder, private subjectService: CreateSubjectService, private adminService: AdminService) {
    this.subjectForm = this.fb.group({
      subjectName: ['', Validators.required],
      subjectYear: ['', Validators.required],
      subjectAcronim: ['', Validators.required],
      subjectSemester: ['', {
        validators: [Validators.required, Validators.min(1), Validators.max(2)],
        asyncValidators: [],
        updateOn: 'blur'
      }]
    });
  }

  ngOnInit() {
    this.degree = this.subjectService.getDegree();
  }

  closePopup(): void {
    this.subjectService.closeCreateSubjectPopup();
  }

  createSubject(): void {

    if (!this.subjectForm.valid) {
      return;
    }

    if (!this.degree || !this.degree.id) {
      return;
    }

    const subject: Subject = {
      name: this.subjectForm.value.subjectName,
      year: this.subjectForm.value.subjectYear,
      acronomy: this.subjectForm.value.subjectAcronim,
      semester: this.subjectForm.value.subjectSemester,
      degree_id: this.degree?.id
    }

    this.adminService.addSubject(subject, this.degree.id).subscribe((res: Subject) => {
      this.subjectService.closeCreateSubjectPopup();
      this.subjectService.created.emit(res);
    });
  }


}
