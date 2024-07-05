import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Degree, Group, Subject } from '../../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class CreateGroupService {

  created: EventEmitter<Group> = new EventEmitter<Group>();

  private isOpenSubject = new BehaviorSubject<boolean>(false);
  isOpen$ = this.isOpenSubject.asObservable();

  private subjectSubject = new BehaviorSubject<Subject | undefined>(undefined);
  subject$ = this.subjectSubject.asObservable();

  openCreateGroupPopup(degree: Degree, subject: Subject): void {
    this.subjectSubject.next(subject);
    this.isOpenSubject.next(true);
  }

  closeCreateGroupPopup(): void {
    this.isOpenSubject.next(false);
    this.subjectSubject.next(undefined);
  }

  isOpen(): boolean {
    return this.isOpenSubject.getValue();
  }

  getSubject(): Subject | undefined {
    return this.subjectSubject.getValue();
  }
}
