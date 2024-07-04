import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Degree } from '../../../interfaces';
import { CommonModule } from '@angular/common';
import { UserService } from '../../user.service';
import { AdminService } from '../admin.service';
import { CreateDegreeService } from '../../popups/create-degree/create-degree-service.service';

@Component({
  selector: 'app-degrees',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './degrees.component.html',
  styleUrls: ['./degrees.component.css', '../childs.css']
})
export class DegreesComponent implements OnInit{
  degreeSelect: Degree | undefined;
  degrees: Degree[] = [];

  degreeForm: FormGroup;

  constructor(
    private fb: FormBuilder, 
    private userService: UserService, 
    private adminService: AdminService,
    private createDegreeService: CreateDegreeService
  ) {
    this.degreeForm = this.fb.group({
      degreeName: ['', Validators.required],
      degreeYears: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.getDegrees();
    this.createDegreeService.created.subscribe((res: Degree) => {
      this.degrees.push(res);
    });
  }

  getDegrees() {
    this.userService.getAllDegrees().subscribe((res: Degree[]) => {
      this.degrees = res;
      if (res.length > 0) {
        this.degreeSelect = res[0];
        this.setDegree(res[0]);
      }
    });
  }

  createDegree() {
    this.createDegreeService.openCreateDegreePopup();
  }

  setDegree(degree: Degree | undefined) {
    if (degree) {
      this.degreeSelect = degree;
      this.degreeForm.setValue({
        degreeName: degree.name,
        degreeYears: degree.years
      });
    }
  }

  updateDegree() {
    if (this.degreeSelect) {
      const degree: Degree = {
        id: this.degreeSelect.id,
        name: this.degreeForm.value.degreeName,
        years: this.degreeForm.value.degreeYears
      }

      this.adminService.updateDegree(degree).subscribe((res: Degree) => {
        this.degrees = this.degrees.map((d: Degree) => {
          if (d.id === res.id) {
            return res;
          }
          return d;
        });
        this.degreeSelect = res;
      });
    }
  }

  deleteDegree() {
    const degree = this.degreeSelect;
    if (degree && degree.id) {
      this.adminService.deleteDegree(degree.id).subscribe(() => {
        this.degrees = this.degrees.filter((d: Degree) => d.id !== degree.id);
        if (this.degrees.length > 0) {
          this.degreeSelect = this.degrees[0];
          this.setDegree(this.degrees[0]);
        } else {
          this.degreeSelect = undefined;
          this.degreeForm.reset();
        }
      });
    }
  }


  checkIfChanged() {
    return this.degreeSelect?.name !== this.degreeForm.value.degreeName ||  this.degreeSelect?.years !== this.degreeForm.value.degreeYears;
  }


}
