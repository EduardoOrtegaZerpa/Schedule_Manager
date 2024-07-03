import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Degree } from '../../../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-degrees',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './degrees.component.html',
  styleUrls: ['./degrees.component.css', '../childs.css']
})
export class DegreesComponent {
  degreeName: string = '';
  degreeYears: number | null = null;
  degreeSelect: Degree | undefined;
  degrees: Degree[] = [];

  degreeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.degreeForm = this.fb.group({
      degreeName: ['', Validators.required],
      degreeYears: ['', Validators.required]
    });
  }


}
