import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Teacher, Class, Room, Absence, ScheduleEntry, Student } from '../types/schedule';
import { mockData } from '../data/mockData';
import { format, addWeeks, parse, isBefore, getDay } from 'date-fns';

interface DataContextType {
  teachers: Teacher[];
  classes: Class[];
  rooms: Room[];
  absences: Absence[];
  scheduleEntries: ScheduleEntry[];
  students: Student[];
  updateTeacher: (id: string, updatedTeacher: Teacher) => Promise<void>;
  addTeacher: (teacher: Omit<Teacher, 'id'>) => Promise<void>;
  deleteTeacher: (id: string) => Promise<void>;
  updateRoom: (id: string, updatedRoom: Room) => Promise<void>;
  addRoom: (room: Omit<Room, 'id'>) => Promise<void>;
  deleteRoom: (id: string) => Promise<void>;
  updateClass: (id: string, updatedClass: Class) => Promise<void>;
  addClass: (cls: Omit<Class, 'id'>) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addAbsence: (absence: Omit<Absence, 'id'>) => Promise<void>;
  updateAbsence: (id: string, absence: Absence) => Promise<void>;
  deleteAbsence: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Omit<Student, 'id'>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  getStudentsByClass: (classId: string) => Student[];
  addScheduleEntry: (entry: Omit<ScheduleEntry, 'id' | 'courseId'>) => Promise<void>;
  updateScheduleEntry: (id: string, entry: Omit<ScheduleEntry, 'id' | 'courseId'>) => Promise<void>;
  deleteScheduleEntry: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [teachers, setTeachers] = useState<Teacher[]>(mockData.teachers);
  const [classes, setClasses] = useState<Class[]>(mockData.classes);
  const [rooms, setRooms] = useState<Room[]>(mockData.rooms);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>(mockData.scheduleEntries);
  const [students, setStudents] = useState<Student[]>([]);

  // Teachers
  const addTeacher = useCallback(async (teacher: Omit<Teacher, 'id'>) => {
    try {
      const { data, error } = await supabase.from('teachers').insert([teacher]).select().single();
      if (error) throw error;
      if (data) {
        setTeachers(current => [...current, data as Teacher]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du professeur:', error);
      throw error;
    }
  }, []);

  const updateTeacher = useCallback(async (id: string, teacher: Teacher) => {
    try {
      const { error } = await supabase.from('teachers').update(teacher).eq('id', id);
      if (error) throw error;
      setTeachers(current => current.map(t => t.id === id ? teacher : t));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du professeur:', error);
      throw error;
    }
  }, []);

  const deleteTeacher = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('teachers').delete().eq('id', id);
      if (error) throw error;
      setTeachers(current => current.filter(t => t.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du professeur:', error);
      throw error;
    }
  }, []);

  // Rooms
  const addRoom = useCallback(async (room: Omit<Room, 'id'>) => {
    try {
      const { data, error } = await supabase.from('rooms').insert([room]).select().single();
      if (error) throw error;
      if (data) {
        setRooms(current => [...current, data as Room]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la salle:', error);
      throw error;
    }
  }, []);

  const updateRoom = useCallback(async (id: string, room: Room) => {
    try {
      const { error } = await supabase.from('rooms').update(room).eq('id', id);
      if (error) throw error;
      setRooms(current => current.map(r => r.id === id ? room : r));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la salle:', error);
      throw error;
    }
  }, []);

  const deleteRoom = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (error) throw error;
      setRooms(current => current.filter(r => r.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la salle:', error);
      throw error;
    }
  }, []);

  // Classes
  const addClass = useCallback(async (cls: Omit<Class, 'id'>) => {
    try {
      const { data, error } = await supabase.from('classes').insert([cls]).select().single();
      if (error) throw error;
      if (data) {
        setClasses(current => [...current, data as Class]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la classe:', error);
      throw error;
    }
  }, []);

  const updateClass = useCallback(async (id: string, cls: Class) => {
    try {
      const { error } = await supabase.from('classes').update(cls).eq('id', id);
      if (error) throw error;
      setClasses(current => current.map(c => c.id === id ? cls : c));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la classe:', error);
      throw error;
    }
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('classes').delete().eq('id', id);
      if (error) throw error;
      setClasses(current => current.filter(c => c.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de la classe:', error);
      throw error;
    }
  }, []);

  // Students
  const addStudent = useCallback(async (student: Omit<Student, 'id'>) => {
    try {
      const { data, error } = await supabase.from('students').insert([{
        name: student.name,
        student_number: student.studentNumber,
        birthdate: format(student.birthDate, 'yyyy-MM-dd'),
        gender: student.gender,
        class_id: student.classId
      }]).select().single();
      
      if (error) throw error;
      if (data) {
        setStudents(current => [...current, {
          id: data.id,
          name: data.name,
          studentNumber: data.student_number,
          birthDate: new Date(data.birthdate),
          gender: data.gender,
          classId: data.class_id
        }]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
      throw error;
    }
  }, []);

  const updateStudent = useCallback(async (id: string, student: Omit<Student, 'id'>) => {
    try {
      const { error } = await supabase.from('students').update({
        name: student.name,
        student_number: student.studentNumber,
        birthdate: format(student.birthDate, 'yyyy-MM-dd'),
        gender: student.gender,
        class_id: student.classId
      }).eq('id', id);
      
      if (error) throw error;
      setStudents(current => current.map(s => s.id === id ? { ...student, id } : s));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'étudiant:', error);
      throw error;
    }
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      setStudents(current => current.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
      throw error;
    }
  }, []);

  const getStudentsByClass = useCallback((classId: string) => {
    return students.filter(student => student.classId === classId);
  }, [students]);

  // Absences
  const addAbsence = useCallback(async (absence: Omit<Absence, 'id'>) => {
    try {
      const { data, error } = await supabase.from('absences').insert([absence]).select().single();
      if (error) throw error;
      if (data) {
        setAbsences(current => [...current, data as Absence]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'absence:', error);
      throw error;
    }
  }, []);

  const updateAbsence = useCallback(async (id: string, absence: Absence) => {
    try {
      const { error } = await supabase.from('absences').update(absence).eq('id', id);
      if (error) throw error;
      setAbsences(current => current.map(a => a.id === id ? absence : a));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'absence:', error);
      throw error;
    }
  }, []);

  const deleteAbsence = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('absences').delete().eq('id', id);
      if (error) throw error;
      setAbsences(current => current.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'absence:', error);
      throw error;
    }
  }, []);

  // Schedule Entries
  const addScheduleEntry = useCallback(async (entry: Omit<ScheduleEntry, 'id' | 'courseId'>, isRecurring: boolean = false) => {
    try {
      const entries: Omit<ScheduleEntry, 'id' | 'courseId'>[] = [entry];

      // Si l'événement est récurrent, créer des entrées jusqu'à la fin de l'année scolaire
      if (isRecurring) {
        const currentDate = parse(entry.date, 'yyyy-MM-dd', new Date());
        const endDate = new Date(2025, 5, 30); // 30 juin 2025
        let nextDate = addWeeks(currentDate, 1);

        while (isBefore(nextDate, endDate)) {
          entries.push({
            ...entry,
            date: format(nextDate, 'yyyy-MM-dd')
          });
          nextDate = addWeeks(nextDate, 1);
        }
      }

      // Insérer toutes les entrées dans la base de données
      const { data, error } = await supabase.from('schedule_entries')
        .insert(entries.map(e => ({
          teacher_id: e.teacherId,
          room_id: e.roomId,
          class_id: e.groupIds[0],
          subject: e.subject,
          date: e.date,
          start_time: e.timeSlot.start,
          end_time: e.timeSlot.end
        })))
        .select();

      if (error) throw error;
      if (data) {
        const newEntries: ScheduleEntry[] = data.map(entry => ({
          id: entry.id,
          courseId: `${entry.id}-course`,
          teacherId: entry.teacher_id,
          roomId: entry.room_id,
          subject: entry.subject,
          groupIds: [entry.class_id],
          date: entry.date,
          timeSlot: {
            start: entry.start_time.slice(0, 5),
            end: entry.end_time.slice(0, 5)
          }
        }));
        setScheduleEntries(current => [...current, ...newEntries]);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'entrée d\'horaire:', error);
      throw error;
    }
  }, []);

  const updateScheduleEntry = useCallback(async (id: string, entry: Omit<ScheduleEntry, 'id' | 'courseId'>) => {
    try {
      const { error } = await supabase.from('schedule_entries').update({
        teacher_id: entry.teacherId,
        room_id: entry.roomId,
        class_id: entry.groupIds[0],
        subject: entry.subject,
        date: entry.date,
        start_time: entry.timeSlot.start,
        end_time: entry.timeSlot.end
      }).eq('id', id);

      if (error) throw error;
      setScheduleEntries(current => current.map(e => e.id === id ? { ...entry, id, courseId: `${id}-course` } : e));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entrée d\'horaire:', error);
      throw error;
    }
  }, []);

  const deleteScheduleEntry = useCallback(async (id: string, deleteRecurring: boolean = false) => {
    try {
      if (!deleteRecurring) {
        const { error } = await supabase.from('schedule_entries').delete().eq('id', id);
        if (error) throw error;
        setScheduleEntries(current => current.filter(e => e.id !== id));
      } else {
        // Récupérer l'entrée à supprimer pour obtenir ses informations
        const entryToDelete = scheduleEntries.find(e => e.id === id);
        if (!entryToDelete) return;

        // Récupérer le jour de la semaine et l'heure de l'entrée
        const dayOfWeek = getDay(parse(entryToDelete.date, 'yyyy-MM-dd', new Date()));
        const { start: startTime, end: endTime } = entryToDelete.timeSlot;

        // Supprimer toutes les entrées correspondantes
        const { error } = await supabase
          .from('schedule_entries')
          .delete()
          .eq('teacher_id', entryToDelete.teacherId)
          .eq('room_id', entryToDelete.roomId)
          .eq('subject', entryToDelete.subject)
          .eq('start_time', startTime)
          .eq('end_time', endTime)
          .gte('date', entryToDelete.date)
          .lte('date', '2025-06-30');

        if (error) throw error;

        // Mettre à jour l'état local
        setScheduleEntries(current => current.filter(entry => {
          if (entry.date < entryToDelete.date) return true;
          
          const entryDay = getDay(parse(entry.date, 'yyyy-MM-dd', new Date()));
          return !(
            entryDay === dayOfWeek &&
            entry.teacherId === entryToDelete.teacherId &&
            entry.roomId === entryToDelete.roomId &&
            entry.subject === entryToDelete.subject &&
            entry.timeSlot.start === startTime &&
            entry.timeSlot.end === endTime
          );
        }));
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée d\'horaire:', error);
      throw error;
    }
  }, [scheduleEntries]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Test Supabase connection
        const { data: connectionTest, error: connectionError } = await supabase.from('teachers').select('count');
        if (connectionError) throw connectionError;

        // Load data if connection is successful
        const { data: teachersData } = await supabase.from('teachers').select('*');
        if (teachersData?.length) setTeachers(teachersData);

        const { data: roomsData } = await supabase.from('rooms').select('*');
        if (roomsData?.length) setRooms(roomsData);

        const { data: classesData } = await supabase.from('classes').select('*');
        if (classesData?.length) setClasses(classesData);

        const { data: studentsData } = await supabase.from('students').select('*');
        if (studentsData?.length) {
          setStudents(studentsData.map(student => ({
            id: student.id,
            name: student.name,
            studentNumber: student.student_number,
            birthDate: new Date(student.birthdate),
            gender: student.gender,
            classId: student.class_id
          })));
        }

        const { data: absencesData } = await supabase.from('absences').select('*');
        if (absencesData) setAbsences(absencesData);

        const { data: scheduleData } = await supabase
          .from('schedule_entries')
          .select('*, teacher:teachers!schedule_entries_teacher_id_fkey(name)');
        
        if (scheduleData?.length) {
          const transformedSchedule = scheduleData.map(entry => ({
            id: entry.id,
            courseId: `${entry.id}-course`,
            teacherId: entry.teacher_id,
            roomId: entry.room_id,
            subject: entry.subject,
            groupIds: [entry.class_id],
            date: entry.date,
            timeSlot: {
              start: entry.start_time.slice(0, 5),
              end: entry.end_time.slice(0, 5)
            }
          }));
          setScheduleEntries(transformedSchedule);
        }
      } catch (error) {
        console.warn('Utilisation des données mockées suite à une erreur de connexion:', error);
      }
    };

    loadData();
  }, []);

  return (
    <DataContext.Provider value={{
      teachers,
      classes,
      rooms,
      absences,
      scheduleEntries,
      students,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addRoom,
      updateRoom,
      deleteRoom,
      addClass,
      updateClass,
      deleteClass,
      addAbsence,
      updateAbsence,
      deleteAbsence,
      addStudent,
      updateStudent,
      deleteStudent,
      getStudentsByClass,
      addScheduleEntry,
      updateScheduleEntry,
      deleteScheduleEntry
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};