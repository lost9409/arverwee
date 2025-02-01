import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Clock, Calendar, X } from 'lucide-react';
import type { Room } from '../../types/schedule';
import { useData } from '../../context/DataContext';
import { format, parse, isWithinInterval, set, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TIME_SLOTS, MORNING_BREAK } from '../../config/constants';

interface AddRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (room: Omit<Room, 'id'>) => void;
  room?: Room;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ isOpen, onClose, onSave, room }) => {
  const [name, setName] = useState(room?.name || '');
  const [capacity, setCapacity] = useState(room?.capacity?.toString() || '30');
  const [type, setType] = useState(room?.type || 'classroom');

  useEffect(() => {
    if (room) {
      setName(room.name);
      setCapacity(room.capacity?.toString() || '30');
      setType(room.type || 'classroom');
    } else {
      setName('');
      setCapacity('30');
      setType('classroom');
    }
  }, [room]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      capacity: parseInt(capacity),
      type
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {room ? 'Modifier un Local' : 'Ajouter un Local'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom du Local</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Capacité</label>
            <input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            >
              <option value="classroom">Salle de classe</option>
              <option value="workshop">Atelier</option>
              <option value="lab">Laboratoire</option>
              <option value="gym">Gymnase</option>
              <option value="other">Autre</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
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
              {room ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RoomManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedTime, setSelectedTime] = useState(format(new Date(), 'HH:mm'));
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { rooms, addRoom, updateRoom, deleteRoom, scheduleEntries, absences, teachers } = useData();

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setIsAddRoomModalOpen(true);
  };

  const handleSaveRoom = async (roomData: Omit<Room, 'id'>) => {
    try {
      if (selectedRoom) {
        await updateRoom(selectedRoom.id, { ...selectedRoom, ...roomData });
      } else {
        await addRoom(roomData);
      }
      setIsAddRoomModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la salle:', error);
      alert('Une erreur est survenue lors de la sauvegarde de la salle');
    }
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setIsAddRoomModalOpen(true);
  };

  const handleDeleteRoom = async (room: Room) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le local "${room.name}" ?`)) {
      try {
        await deleteRoom(room.id);
      } catch (error) {
        console.error('Erreur lors de la suppression de la salle:', error);
        alert('Une erreur est survenue lors de la suppression de la salle');
      }
    }
  };

  const isRoomAvailable = (room: Room) => {
    // Convertir la date et l'heure sélectionnées
    const selectedDateTime = parse(selectedDate, 'yyyy-MM-dd', new Date());
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const selectedTimeStr = format(new Date().setHours(hours, minutes), 'HH:mm');

    // Trouver le créneau horaire correspondant
    const currentTimeSlot = TIME_SLOTS.find(slot => {
      return selectedTimeStr >= slot.start && selectedTimeStr < slot.end;
    });

    if (!currentTimeSlot) {
      return true; // Si pas dans un créneau défini, considéré comme disponible
    }

    // Vérifier s'il y a un cours prévu dans ce local à la date et l'heure sélectionnées
    const scheduledEntries = scheduleEntries.filter(entry => {
      // Vérifier si c'est le même jour et le même local
      if (entry.date !== selectedDate || entry.roomId !== room.id) {
        return false;
      }

      // Vérifier si c'est le même créneau horaire
      return entry.timeSlot.start === currentTimeSlot.start;
    });

    // Si aucun cours n'est prévu, le local est disponible
    if (scheduledEntries.length === 0) {
      return true;
    }

    // Pour chaque cours prévu, vérifier si le professeur est absent
    return scheduledEntries.every(entry => {
      const teacherAbsence = absences.find(absence => {
        if (absence.teacher_id !== entry.teacherId) return false;

        const eventDate = parse(entry.date, 'yyyy-MM-dd', new Date());
        const absenceStartDate = parse(absence.start_date, 'yyyy-MM-dd', new Date());
        const absenceEndDate = absence.end_date 
          ? parse(absence.end_date, 'yyyy-MM-dd', new Date())
          : absenceStartDate;

        return isSameDay(eventDate, absenceStartDate) || 
               (absence.end_date && eventDate >= absenceStartDate && eventDate <= absenceEndDate);
      });

      // Si le professeur est absent, le local est considéré comme disponible
      return teacherAbsence !== undefined;
    });
  };

  // Effet pour mettre à jour l'état lorsque les données changent
  useEffect(() => {
    const checkAvailability = () => {
      setSearchTerm(prev => prev);
    };

    const interval = setInterval(checkAvailability, 60000);
    return () => clearInterval(interval);
  }, [selectedDate, selectedTime]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Locaux</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2 py-1 border rounded-md"
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <input
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="px-2 py-1 border rounded-md"
                min="08:00"
                max="17:00"
                step="300"
              />
            </div>
          </div>
          <button onClick={handleAddRoom} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-5 h-5" />
            Ajouter un Local
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des locaux..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom du Local
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Disponibilité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms
              .filter(room => room.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{room.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{room.capacity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{room.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isRoomAvailable(room) ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="ml-2 text-sm text-gray-500">
                        {isRoomAvailable(room) ? 'Disponible' : 'Occupé'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="text-red-600 hover:text-red-800"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onSave={handleSaveRoom}
        room={selectedRoom || undefined}
      />
    </div>
  );
};

export default RoomManagement;