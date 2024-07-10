import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Degree, Group, Schedule, Subject } from '../../interfaces';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) { }

  private APIURL = 'https://scheduler.eduortza.com:3001/api';

  addDegree(degree: Degree): Observable<Degree> {
    return this.http.post(`${this.APIURL}/degrees`, degree).pipe(
      map((response: any) => {
        return response.response as Degree;
      }),
      catchError((error) => {
        this.notificationService.show('Error creating degree');
        return throwError(() => error);
      })
    );
  }

  updateDegree(degree: Degree): Observable<Degree> {
    return this.http.put(`${this.APIURL}/degrees/` + degree.id, degree).pipe(
      map((response: any) => {
        return response.response as Degree;
      }),
      catchError((error) => {
        this.notificationService.show('Error updating degree');
        return throwError(() => error);
      })
    );
  }

  deleteDegree(id: number): Observable<any> {
    return this.http.delete(`${this.APIURL}/degrees/` + id).pipe(
      catchError((error) => {
        this.notificationService.show('Error deleting degree');
        return throwError(() => error);
      })
    );
  }

  addSubject(subject: Subject, degreeId: number): Observable<Subject> {
    return this.http.post(`${this.APIURL}/subjects/` + degreeId, subject).pipe(
      map((response: any) => {
        return response.response as Subject;
      }),
      catchError((error) => {
        this.notificationService.show('Error creating subject');
        return throwError(() => error);
      })
    );
  }

  updateSubject(subject: Subject): Observable<Subject> {
    return this.http.put(`${this.APIURL}/subjects/` + subject.id, subject).pipe(
      map((response: any) => {
        return response.response as Subject;
      }),
      catchError((error) => {
        this.notificationService.show('Error updating subject');
        return throwError(() => error);
      })
    );
  }

  deleteSubject(id: number): Observable<any> {
    return this.http.delete(`${this.APIURL}/subjects/` + id).pipe(
      catchError((error) => {
        this.notificationService.show('Error deleting subject');
        return throwError(() => error);
      })
    );
  }

  addGroup(group: Group, subjectId: number): Observable<Group> {
    return this.http.post(`${this.APIURL}/groups/` + subjectId, group).pipe(
      map((response: any) => {
        return response.response as Group;
      }),
      catchError((error) => {
        this.notificationService.show('Error creating group');
        return throwError(() => error);
      })
    );
  }

  updateGroup(group: Group): Observable<Group> {
    return this.http.put(`${this.APIURL}/groups/` + group.id, group).pipe(
      map((response: any) => {
        return response.response as Group;
      }),
      catchError((error) => {
        this.notificationService.show('Error updating group');
        return throwError(() => error);
      })
    );
  }

  deleteGroup(id: number): Observable<any> {
    return this.http.delete(`${this.APIURL}/groups/` + id).pipe(
      catchError((error) => {
        this.notificationService.show('Error deleting group');
        return throwError(() => error);
      })
    );
  }

  addSchedule(schedule: Schedule, groupId: number): Observable<Schedule> {
    return this.http.post(`${this.APIURL}/schedules/` + groupId, schedule).pipe(
      map((response: any) => {
        return response.response as Schedule;
      }),
      catchError((error) => {
        this.notificationService.show('Error creating schedule');
        return throwError(() => error);
      })
    );
  }

  updateSchedule(schedule: Schedule): Observable<Schedule> {
    return this.http.put(`${this.APIURL}/schedules/` + schedule.id, schedule).pipe(
      map((response: any) => {
        return response.response as Schedule;
      }),
      catchError((error) => {
        this.notificationService.show('Error updating schedule');
        return throwError(() => error);
      })
    );
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${this.APIURL}/schedules/` + id).pipe(
      catchError((error) => {
        this.notificationService.show('Error deleting schedule');
        return throwError(() => error);
      })
    );
  }


}
