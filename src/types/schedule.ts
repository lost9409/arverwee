export type TimeSlot = {
  start: string;
  end: string;
};

export type Teacher = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  abbreviation?: string;
  subjects: string[];
};

export type Room = {
  id: string;
  name: string;
  capacity: number;
  type?: string;
};

export type Class = {
  id: string;
  name: string;
  level: string;
  student_count?: number;
  adult_count?: number;
};

export type Student = {
  id: string;
  name: string;
  studentNumber: string;
  birthDate: Date;
  gender: 'M' | 'F';
  classId: string;
};

export type ScheduleEntry = {
  id: string;
  courseId: string;
  teacherId: string;
  roomId: string;
  subject: string;
  groupIds: string[];
  date: string;
  timeSlot: TimeSlot;
};

export type Absence = {
  id: string;
  teacher_id: string;
  start_date: string;
  end_date?: string;
  type: 'absence' | 'delay';
  delay_time_str?: string;
};