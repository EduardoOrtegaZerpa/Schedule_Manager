export interface Schedule {
    id?: string;
    group_id: string;
    startTime: Date;
    endTime: Date;
    day: string;
    hall: string;
}

export interface Group {
    id?: string;
    degree_id: string;
    subject_id: string;
    name: string;
    details: string;
}

export interface Degree {
    id?: string;
    name: string;
    years: number;
}

export interface Subject {
    id?: string;
    degree_id: string;
    name: string;
    acronomy: string;
    year: number;
}