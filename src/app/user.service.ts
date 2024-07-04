import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, throwError } from 'rxjs';
import { Degree, Subject, Group, Schedule } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private APIURL = 'http://localhost:3001/api';

  getAllDegrees() {
    this.http.get(`${this.APIURL}/degrees`).pipe(
      map((response: any) => {
        return response.response as Degree[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getDegreeById(id: string) {
    this.http.get(`${this.APIURL}/degrees/` + id).pipe(
      map((response: any) => {
        return response.response as Degree;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getAllSubjects() {
    this.http.get(`${this.APIURL}/subjects`).pipe(
      map((response: any) => {
        return response.response as Subject[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getSubjectById(id: string) {
    this.http.get(`${this.APIURL}/subjects/` + id).pipe(
      map((response: any) => {
        return response.response as Subject;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getSubjectsByDegreeId(degreeId: string) {
    this.http.get(`${this.APIURL}/degrees/` + degreeId + '/subjects').pipe(
      map((response: any) => {
        return response.response as Subject[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getAllGroups() {
    this.http.get(`${this.APIURL}/groups`).pipe(
      map((response: any) => {
        return response.response as Group[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getGroupById(id: string) {
    this.http.get(`${this.APIURL}/groups/` + id).pipe(
      map((response: any) => {
        return response.response as Group;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getGroupsBySubjectId(subjectId: string) {
    this.http.get(`${this.APIURL}/subjects/` + subjectId + '/groups').pipe(
      map((response: any) => {
        return response.response as Group[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getAllSchedules() {
    this.http.get(`${this.APIURL}/schedules`).pipe(
      map((response: any) => {
        return response.response as Schedule[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getScheduleById(id: string) {
    this.http.get(`${this.APIURL}/schedules/` + id).pipe(
      map((response: any) => {
        return response.response as Schedule;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

  getSchedulesByGroupId(groupId: string) {
    this.http.get(`${this.APIURL}/groups/` + groupId + '/schedules').pipe(
      map((response: any) => {
        return response.response as Schedule[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    )
  }

}
