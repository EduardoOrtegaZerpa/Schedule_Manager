import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, throwError, Observable, forkJoin, switchMap } from 'rxjs';
import { Degree, Subject, Group, Schedule, AlgorithmResponse, SchedulesInfo } from '../interfaces';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private APIURL = 'https://scheduler.eduortza.com:3001/api';

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

  getDegreeById(id: number): Observable<Degree> {
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

  getSubjectById(id: number): Observable<Subject> {
    return this.http.get(`${this.APIURL}/subjects/` + id).pipe(
      map((response: any) => {
        return response.response as Subject;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getSubjectsByDegreeId(degreeId: number): Observable<Subject[]> {
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

  getGroupById(id: number): Observable<Group> {
    return this.http.get(`${this.APIURL}/groups/` + id).pipe(
      map((response: any) => {
        return response.response as Group;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getGroupsBySubjectId(subjectId: number): Observable<Group[]> {
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

  getScheduleById(id: number): Observable<Schedule> {
    return this.http.get(`${this.APIURL}/schedules/` + id).pipe(
      map((response: any) => {
        return response.response as Schedule;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  getSchedulesByGroupId(groupId: number): Observable<Schedule[]> {
    return this.http.get(`${this.APIURL}/groups/` + groupId + '/schedules').pipe(
      map((response: any) => {
        return response.response as Schedule[];
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  generateNoConflictSchedules(subjectIds: number[]): Observable<AlgorithmResponse> {
    return this.http.post(`${this.APIURL}/generate/schedule`, { subjectIds }).pipe(
      map((response: any) => {
        return response.response as AlgorithmResponse;
      }),
      catchError((error) => {
        throwError(() => error);
        return [];
      })
    );
  }

  generateLessOptimalSchedules(subjectIds: number[], days: number, hours: number): Observable<AlgorithmResponse> {
    return this.http.post(`${this.APIURL}/generate/schedule/${days}/${hours}`, { subjectIds }).pipe(
      map((response: any) => {
        return response.response as AlgorithmResponse;
      }),
      catchError((error) => {
        throwError(() => error);
        return [];
      })
    );
  }

  convertResponseToScheduleInfo(response: AlgorithmResponse): Observable<SchedulesInfo[]> {
    const observables = response.subjects.map((subject) => {
        return this.getGroupById(subject.group).pipe(
            switchMap((group: Group) => 
                this.getSubjectById(subject.subject).pipe(
                    switchMap((subject: Subject) => 
                        this.getSchedulesByGroupId(group.id!).pipe(
                            map((schedules: Schedule[]) => 
                                schedules.map((schedule) => ({
                                    subject,
                                    group,
                                    schedule
                                }))
                            )
                        )
                    )
                )
            )
        );
    });

    return forkJoin(observables).pipe(
        map(results => results.flat())
    );
}


}
