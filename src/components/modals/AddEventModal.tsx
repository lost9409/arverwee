import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Teacher, Room } from '../../types/schedule';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    teacherId: string;
    roomId: string;
    subject: string;
    isRecurring: boolean;
  }) => void;
  onDelete?: () => void;
  selectedDate?: string;
  selectedTime?: { start: string; end: string };
  teachers: Teacher[];
  rooms: Room[];
  event?: any;
}

const AddEventModal = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  selectedTime,
  teachers,
  rooms,
  event
}: AddEventModalProps) => {
  const [teacherId, setTeacherId] = useState('');
  const [roomId, setRoomId] = useState('');
  const [subject, setSubject] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    if (event) {
      setTeacherId(event.teacherId || '');
      setRoomId(event.roomId || '');
      setSubject(event.subject || '');
    } else {
      setTeacherId('');
      setRoomId('');
      setSubject('');
      setIsRecurring(false);
    }
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      teacherId,
      roomId,
      subject,
      isRecurring
    });
  };

  const handleDelete = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      onDelete?.();
    }
  };

  if (!isOpen) return null;

  const selectedTeacher = teachers.find(t => t.id === teacherId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {event ? 'Modifier le Cours' : 'Ajouter un Cours'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {selectedDate && selectedTime && (
            <div className="text-sm text-gray-600">
              <p>Date : {format(new Date(selectedDate), 'dd MMMM yyyy', { locale: fr })}</p>
              <p>Horaire : {selectedTime.start} - {selectedTime.end}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Professeur</label>
            <select
              value={teacherId}
              onChange={(e) => {
                setTeacherId(e.target.value);
                if (selectedTeacher) {
                  setSubject('');
                }
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner un professeur</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          {teacherId && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Matière</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Sélectionner une matière</option>
                {selectedTeacher?.subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Local</label>
            <select
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="">Sélectionner un local</option>
              {rooms.map(room => (
                <option key={room.id} value={room.id}>
                  {room.name} ({room.capacity} places)
                </option>
              ))}
            </select>
          </div>

          {!event && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                Répéter chaque semaine jusqu'à la fin de l'année
              </label>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <div>
              {event && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {event ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEventModal;