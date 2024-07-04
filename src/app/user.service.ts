import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, throwError, Observable } from 'rxjs';
import { Degree, Subject, Group, Schedule } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private APIURL = 'http://localhost:3001/api';

  getAllDegrees(): Observable<Degree[]> {
    return this.http.get(`${this.APIURL}/degrees`).pipe(
      map((response: any) => {
        return response.response as Degree[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getDegreeById(id: string): Observable<Degree> {
    return this.http.get(`${this.APIURL}/degrees/` + id).pipe(
      map((response: any) => {
        return response.response as Degree;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getAllSubjects(): Observable<Subject[]> {
    return this.http.get(`${this.APIURL}/subjects`).pipe(
      map((response: any) => {
        return response.response as Subject[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getSubjectById(id: string): Observable<Subject> {
    return this.http.get(`${this.APIURL}/subjects/` + id).pipe(
      map((response: any) => {
        return response.response as Subject;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getSubjectsByDegreeId(degreeId: string): Observable<Subject[]> {
    return this.http.get(`${this.APIURL}/degrees/` + degreeId + '/subjects').pipe(
      map((response: any) => {
        return response.response as Subject[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getAllGroups(): Observable<Group[]> {
    return this.http.get(`${this.APIURL}/groups`).pipe(
      map((response: any) => {
        return response.response as Group[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getGroupById(id: string): Observable<Group> {
    return this.http.get(`${this.APIURL}/groups/` + id).pipe(
      map((response: any) => {
        return response.response as Group;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getGroupsBySubjectId(subjectId: string): Observable<Group[]> {
    return this.http.get(`${this.APIURL}/subjects/` + subjectId + '/groups').pipe(
      map((response: any) => {
        return response.response as Group[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getAllSchedules(): Observable<Schedule[]> {
    return this.http.get(`${this.APIURL}/schedules`).pipe(
      map((response: any) => {
        return response.response as Schedule[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getScheduleById(id: string): Observable<Schedule> {
    return this.http.get(`${this.APIURL}/schedules/` + id).pipe(
      map((response: any) => {
        return response.response as Schedule;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getSchedulesByGroupId(groupId: string): Observable<Schedule[]> {
    return this.http.get(`${this.APIURL}/groups/` + groupId + '/schedules').pipe(
      map((response: any) => {
        return response.response as Schedule[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

}
