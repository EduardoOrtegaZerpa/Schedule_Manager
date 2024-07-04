import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Degree } from '../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CreateSubjectService{

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private degreeSubject = new BehaviorSubject<Degree | null>(null);
  degree$ = this.degreeSubject.asObservable();

  openCreateSubjectPopup(degree: Degree): void {
    this.degreeSubject.next(degree);
    this.isOpenSubject.next(true);
  }

  isOpen(): boolean {
    return this.isOpenSubject.getValue();
  }

  closeCreateSubjectPopup(): void {
    this.isOpenSubject.next(false);
    this.degreeSubject.next(null);
  }

  getDegree(): Degree | null {
    return this.degreeSubject.getValue();
  }
}
