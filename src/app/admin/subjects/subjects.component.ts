import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Degree, Subject } from '../../../interfaces';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [FormsModule],
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
}
