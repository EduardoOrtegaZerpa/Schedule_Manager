import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Degree } from '../../../interfaces';

@Component({
  selector: 'app-degrees',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './degrees.component.html',
  styleUrls: ['./degrees.component.css', '../childs.css']
})
export class DegreesComponent {
  degreeName: string = '';
  degreeYears: number | null = null;
  degreeSelect: Degree | undefined;
  degrees: Degree[] = [];

}
