import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, throwError, Observable } from 'rxjs';
import { Degree, Subject, Group, Schedule, AlgorithmResponse, SchedulesInfo } from '../interfaces';


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  private APIURL = 'http://eduortza.com:3001/api';

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
      return new Observable<SchedulesInfo[]>((observer) => {
          const schedulesInfo: SchedulesInfo[] = [];
          if (response.subjects.length === 0) {
              observer.next(schedulesInfo);
              observer.complete();
          }
          response.subjects.map((subject) => {
              this.getGroupById(subject.group).subscribe({
                  next: (group: Group) => {
                      this.getSubjectById(subject.subject).subscribe({
                          next: (subject: Subject) => {
                              this.getSchedulesByGroupId(group.id!).subscribe({
                                  next: (schedules: Schedule[]) => {
                                      schedules.map((schedule) => {
                                          schedulesInfo.push({
                                              subject,
                                              group,
                                              schedule
                                          });
                                      });
                                  },
                                  complete: () => {
                                      observer.next(schedulesInfo);
                                      observer.complete();
                                  },
                                  error: (error) => {
                                      observer.error(error);
                                  }
                              });
                          }
                      });
                  }
              });
          });
      });
  }

}
