export interface Schedule {
    id?: number;
    group_id: number;
    startTime: Date;
    endTime: Date;
    day: string;
    hall: string;
}

export interface SchedulesInfo {
    schedule: Schedule;
    subject: Subject;
    group: Group;
}

export interface AlgorithmResponse {
    days: number;
    hours: number;
    subjects: AlgorithmSubject[];
}

export interface AlgorithmSubject {
    subject: number;
    group: number;
}

export interface Group {
    id?: number;
    degree_id: number;
    subject_id: number;
    name: string;
    details: string;
}

export interface Degree {
    id?: number;
    name: string;
    years: number;
}

export interface Subject {
    id?: number;
    degree_id: number;
    name: string;
    acronomy: string;
    year: number;
    semester: number;
}
