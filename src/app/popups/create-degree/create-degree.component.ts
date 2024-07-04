import { Component, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Degree } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { CreateDegreeService } from './create-degree-service.service';
import { AdminService } from '../../admin/admin.service';

@Component({
  selector: 'app-create-degree',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  templateUrl: './create-degree.component.html',
  styleUrls: ['./create-degree.component.css', '../popup-common.css']
})
export class CreateDegreeComponent{

  degreeForm: FormGroup;

  constructor(private fb: FormBuilder, private degreeService: CreateDegreeService, private adminService: AdminService) {
    this.degreeForm = this.fb.group({
      degreeName: ['', Validators.required],
      degreeYears: ['', Validators.required]
    });
  }

  closePopup(): void {
    this.degreeService.closeCreateDegreePopup();
  }

  createDegree(): void {
    const degree: Degree = {
      name: this.degreeForm.value.degreeName,
      years: this.degreeForm.value.degreeYears
    }

    this.adminService.addDegree(degree).subscribe((res: Degree) => {
      this.degreeService.created.emit(res);
      this.closePopup();
    });
  }


    

}
