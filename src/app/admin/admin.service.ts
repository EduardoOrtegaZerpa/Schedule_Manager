import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { Degree, Group, Schedule, Subject } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  private APIURL = 'http://localhost:3001/api';

  addDegree(degree: Degree) {
    this.http.post(`${this.APIURL}/degrees`, degree).pipe(
      map((response: any) => {
        return response.response as Degree;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  updateDegree(degree: Degree) {
    this.http.put(`${this.APIURL}/degrees/` + degree.id, degree).pipe(
      map((response: any) => {
        return response.response as Degree;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  deleteDegree(id: string) {
    this.http.delete(`${this.APIURL}/degrees/` + id).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  addSubject(subject: Subject, degreeId: string) {
    this.http.post(`${this.APIURL}/subjects/` + degreeId, subject).pipe(
      map((response: any) => {
        return response.response as Subject;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  updateSubject(subject: Subject) {
    this.http.put(`${this.APIURL}/subjects/` + subject.id, subject).pipe(
      map((response: any) => {
        return response.response as Subject;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  deleteSubject(id: string) {
    this.http.delete(`${this.APIURL}/subjects/` + id).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  addGroup(group: Group, subjectId: string) {
    this.http.post(`${this.APIURL}/groups/` + subjectId, group).pipe(
      map((response: any) => {
        return response.response as Group;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  updateGroup(group: Group) {
    this.http.put(`${this.APIURL}/groups/` + group.id, group).pipe(
      map((response: any) => {
        return response.response as Group;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  deleteGroup(id: string) {
    this.http.delete(`${this.APIURL}/groups/` + id).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  addSchedule(schedule: Schedule, groupId: string) {
    this.http.post(`${this.APIURL}/schedules/` + groupId, schedule).pipe(
      map((response: any) => {
        return response.response as Schedule;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  updateSchedule(schedule: Schedule) {
    this.http.put(`${this.APIURL}/schedules/` + schedule.id, schedule).pipe(
      map((response: any) => {
        return response.response as Schedule;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  deleteSchedule(id: string) {
    this.http.delete(`${this.APIURL}/schedules/` + id).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }


}
