import { Teacher, Class, Room, ScheduleEntry } from '../types/schedule';
import { eachDayOfInterval, format, addDays, addWeeks, startOfWeek } from 'date-fns';
import { TIME_SLOTS } from '../config/constants';

// Définir la date de début au premier lundi de février 2025
const startDate = startOfWeek(new Date(2025, 1, 1), { weekStartsOn: 1 }); // 3 février 2025
const endDate = new Date(2025, 5, 30); // 30 juin 2025

// Initialiser les tableaux vides
const teachers: Teacher[] = [];
const classes: Class[] = [];
const rooms: Room[] = [];
const scheduleEntries: ScheduleEntry[] = [];

// Exporter les données vides
export const mockData = {
  teachers,
  classes,
  rooms,
  scheduleEntries
};