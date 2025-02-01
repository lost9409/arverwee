export type SlotType = 'course' | 'break' | 'lunch';

export const TIME_SLOTS = [
  { id: 1, start: '08:05', end: '08:55', type: 'course' as SlotType, label: '1ère période' },
  { id: 2, start: '08:55', end: '09:45', type: 'course' as SlotType, label: '2ème période' },
  { id: 3, start: '09:45', end: '10:35', type: 'course' as SlotType, label: '3ème période' },
  { id: 4, start: '10:50', end: '11:40', type: 'course' as SlotType, label: '4ème période' },
  { id: 5, start: '11:40', end: '12:30', type: 'course' as SlotType, label: '5ème période' },
  { id: 6, start: '12:30', end: '13:30', type: 'lunch' as SlotType, label: 'Pause midi' },
  { id: 7, start: '13:30', end: '14:20', type: 'course' as SlotType, label: '7ème période' },
  { id: 8, start: '14:20', end: '15:10', type: 'course' as SlotType, label: '8ème période' },
  { id: 9, start: '15:10', end: '16:00', type: 'course' as SlotType, label: '9ème période' },
  { id: 10, start: '16:00', end: '16:50', type: 'course' as SlotType, label: '10ème période' }
] as const;

export const PERIOD_TYPES = {
  course: 'Cours',
  break: 'Pause',
  lunch: 'Pause midi'
} as const;

export const SLOT_DURATION = '00:50:00';
export const SCHOOL_START_TIME = '08:00:00';
export const SCHOOL_END_TIME = '17:00:00';