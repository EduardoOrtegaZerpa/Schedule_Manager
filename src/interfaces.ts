export interface Schedule {
    id?: Number;
    group_id: Number;
    startTime: Date;
    endTime: Date;
    day: string;
    hall: string;
}

export interface Group {
    id?: Number;
    degree_id: Number;
    subject_id: Number;
    name: string;
    details: string;
}

export interface Degree {
    id?: Number;
    name: string;
    years: Number;
}

export interface Subject {
    id?: Number;
    degree_id: Number;
    name: string;
    acronomy: string;
    year: Number;
    semester: Number;
}