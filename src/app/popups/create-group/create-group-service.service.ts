import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Degree, Subject } from '../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CreateGroupService {

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private degreeSubject = new BehaviorSubject<Degree | null>(null);
  degree$ = this.degreeSubject.asObservable();

  private subjectSubject = new BehaviorSubject<Subject | null>(null);
  subject$ = this.subjectSubject.asObservable();

  openCreateGroupPopup(degree: Degree, subject: Subject): void {
    this.degreeSubject.next(degree);
    this.subjectSubject.next(subject);
    this.isOpenSubject.next(true);
  }

  closeCreateGroupPopup(): void {
    this.isOpenSubject.next(false);
    this.degreeSubject.next(null);
    this.subjectSubject.next(null);
  }

  isOpen(): boolean {
    return this.isOpenSubject.getValue();
  }

  getDegree(): Degree | null {
    return this.degreeSubject.getValue();
  }

  getSubject(): Subject | null {
    return this.subjectSubject.getValue();
  }
}
