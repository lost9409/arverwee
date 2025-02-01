import React, { useState } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, parse, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Select } from './ui/select';
import { useData } from '../context/DataContext';
import { TIME_SLOTS, type SlotType } from '../config/constants';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import AddEventModal from './modals/AddEventModal';
import TeacherInfoModal from './modals/TeacherInfoModal';
import DeleteCourseModal from './modals/DeleteCourseModal';
import type { ScheduleEntry, Teacher } from '../types/schedule';

type TimeSlot = typeof TIME_SLOTS[number];

const Schedule = () => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEntry | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; timeSlot: TimeSlot } | null>(null);
  const [selectedTeacherInfo, setSelectedTeacherInfo] = useState<Teacher | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<ScheduleEntry | null>(null);

  const { teachers, classes, rooms, scheduleEntries, absences, addScheduleEntry, updateScheduleEntry, deleteScheduleEntry } = useData();

  const handlePreviousWeek = () => {
    setCurrentWeek(prev => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentWeek(prev => addWeeks(prev, 1));
  };

  const handleToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value === '' ? null : e.target.value);
  };

  const handleTeacherChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTeacher(e.target.value === '' ? null : e.target.value);
  };

  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value === '' ? null : e.target.value);
  };

  const handleTimeSlotClick = (date: Date, timeSlot: TimeSlot) => {
    setSelectedTimeSlot({
      date: format(date, 'yyyy-MM-dd'),
      timeSlot
    });
    setSelectedEvent(null);
    setIsAddEventModalOpen(true);
  };

  const handleEventClick = (event: ScheduleEntry) => {
    setSelectedEvent(event);
    setSelectedTimeSlot(null);
    setIsAddEventModalOpen(true);
  };

  const handleSaveEvent = async (data: {
    teacherId: string;
    roomId: string;
    subject: string;
    isRecurring: boolean;
  }) => {
    try {
      if (selectedEvent) {
        await updateScheduleEntry(selectedEvent.id, {
          ...data,
          date: selectedEvent.date,
          timeSlot: selectedEvent.timeSlot,
          groupIds: selectedEvent.groupIds
        });
      } else if (selectedTimeSlot) {
        const entry = {
          ...data,
          date: selectedTimeSlot.date,
          timeSlot: {
            start: selectedTimeSlot.timeSlot.start,
            end: selectedTimeSlot.timeSlot.end
          },
          groupIds: [selectedClass || classes[0].id]
        };
        await addScheduleEntry(entry);
      }
      setIsAddEventModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du cours:', error);
      alert('Une erreur est survenue lors de la sauvegarde du cours');
    }
  };

  const handleDeleteClick = (event: ScheduleEntry) => {
    setCourseToDelete(event);
    setIsDeleteModalOpen(true);
    setIsAddEventModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!courseToDelete) return;
    try {
      await deleteScheduleEntry(courseToDelete.id);
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
      alert('Une erreur est survenue lors de la suppression du cours');
    }
  };

  const filteredEvents = scheduleEntries.filter(event => {
    if (!selectedClass && !selectedTeacher && !selectedSubject) return false;
    
    if (selectedClass && !event.groupIds.includes(selectedClass)) return false;
    if (selectedTeacher && event.teacherId !== selectedTeacher) return false;
    if (selectedSubject && event.subject !== selectedSubject) return false;
    return true;
  });

  const getEventStyle = (event: ScheduleEntry) => {
    const teacherAbsence = absences.find(absence => {
      if (absence.teacher_id !== event.teacherId) return false;

      const eventDate = parse(event.date, 'yyyy-MM-dd', new Date());
      const absenceStartDate = parse(absence.start_date, 'yyyy-MM-dd', new Date());
      const absenceEndDate = absence.end_date 
        ? parse(absence.end_date, 'yyyy-MM-dd', new Date())
        : absenceStartDate;

      return isSameDay(eventDate, absenceStartDate) || 
             (absence.end_date && eventDate >= absenceStartDate && eventDate <= absenceEndDate);
    });

    if (teacherAbsence) {
      return teacherAbsence.type === 'absence'
        ? 'bg-red-100 border-red-200 text-red-800'
        : 'bg-orange-100 border-orange-200 text-orange-800';
    }

    const room = rooms.find(r => r.id === event.roomId);
    if (room) {
      if (room.name.startsWith('V')) {
        return 'bg-green-100 border-green-200 text-green-800';
      } else if (room.name.startsWith('R')) {
        return 'bg-pink-100 border-pink-200 text-pink-800';
      } else if (room.name.startsWith('M')) {
        return 'bg-amber-100 border-amber-200 text-amber-800';
      }
    }

    return 'bg-blue-100 border-blue-200 text-blue-800';
  };

  const renderEventContent = (event: ScheduleEntry) => {
    const teacher = teachers.find(t => t.id === event.teacherId);
    const room = rooms.find(r => r.id === event.roomId);
    
    return (
      <div
        key={event.id}
        className={`absolute inset-0 m-1 p-1 rounded text-xs overflow-hidden cursor-pointer border ${getEventStyle(event)}`}
        onClick={(e) => {
          e.stopPropagation();
          handleEventClick(event);
        }}
      >
        <div className="font-bold">{event.subject}</div>
        <div 
          className="hover:underline cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            if (teacher) setSelectedTeacherInfo(teacher);
          }}
        >
          {teacher?.name} {teacher?.abbreviation ? `(${teacher.abbreviation})` : ''}
        </div>
        <div>{room?.name}</div>
      </div>
    );
  };

  const weekDays = Array.from({ length: 5 }, (_, i) => addDays(currentWeek, i));

  const getSlotBackgroundColor = (type: SlotType) => {
    switch (type) {
      case 'lunch':
        return 'bg-yellow-50';
      case 'break':
        return 'bg-blue-50';
      default:
        return '';
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousWeek}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold">
              Semaine du {format(currentWeek, 'dd MMMM yyyy', { locale: fr })}
            </h2>
            <button
              onClick={handleNextWeek}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleToday}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100"
            >
              <Calendar className="w-4 h-4" />
              Aujourd'hui
            </button>
          </div>
          <div className="flex gap-4">
            <Select
              placeholder="Filtrer par Classe"
              onChange={handleClassChange}
              className="w-48"
            >
              <option value="">Toutes les Classes</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </Select>
            <Select
              placeholder="Filtrer par Professeur"
              onChange={handleTeacherChange}
              className="w-48"
            >
              <option value="">Tous les Professeurs</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
              ))}
            </Select>
            <Select
              placeholder="Filtrer par Matière"
              onChange={handleSubjectChange}
              className="w-48"
            >
              <option value="">Toutes les Matières</option>
              {[...new Set(scheduleEntries.map(event => event.subject))].map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </Select>
          </div>
        </div>

        {!selectedClass && !selectedTeacher && !selectedSubject ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mb-4" />
            <p className="text-lg">Sélectionnez au moins un filtre pour afficher l'horaire</p>
          </div>
        ) : (
          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-1">
              <div className="h-12"></div>
              {TIME_SLOTS.map(slot => (
                <div
                  key={slot.id}
                  className={`h-20 flex items-center justify-center border-r ${getSlotBackgroundColor(slot.type)}`}
                >
                  <div className="text-center">
                    <div className="font-medium text-sm">P{slot.id}</div>
                    <div className="text-xs text-gray-500">{slot.start}</div>
                    {slot.type !== 'course' && (
                      <div className="text-xs text-blue-600">{slot.label}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {weekDays.map(day => (
              <div key={format(day, 'yyyy-MM-dd')} className="col-span-1">
                <div className="h-12 flex items-center justify-center font-medium border-b">
                  {format(day, 'EEEE dd/MM', { locale: fr })}
                </div>
                {TIME_SLOTS.map(slot => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayEvents = filteredEvents.filter(event => 
                    event.date === dateStr && 
                    event.timeSlot.start === slot.start
                  );

                  return (
                    <div
                      key={`${dateStr}-${slot.id}`}
                      className={`h-20 border-b border-r relative ${getSlotBackgroundColor(slot.type)}`}
                      onClick={() => handleTimeSlotClick(day, slot)}
                    >
                      {dayEvents.map(event => renderEventContent(event))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {(isAddEventModalOpen && (selectedTimeSlot || selectedEvent)) && (
        <AddEventModal
          isOpen={isAddEventModalOpen}
          onClose={() => setIsAddEventModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={() => {
            if (selectedEvent) {
              handleDeleteClick(selectedEvent);
            }
          }}
          selectedDate={selectedTimeSlot?.date || selectedEvent?.date}
          selectedTime={selectedTimeSlot?.timeSlot || selectedEvent?.timeSlot}
          teachers={teachers}
          rooms={rooms}
          event={selectedEvent}
        />
      )}

      {isDeleteModalOpen && courseToDelete && (
        <DeleteCourseModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCourseToDelete(null);
          }}
          onDelete={handleDeleteConfirm}
        />
      )}

      {selectedTeacherInfo && (
        <TeacherInfoModal
          isOpen={true}
          onClose={() => setSelectedTeacherInfo(null)}
          teacher={selectedTeacherInfo}
        />
      )}
    </div>
  );
};

export default Schedule;