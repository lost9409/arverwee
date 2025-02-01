import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { Teacher, Absence } from '../../../types/schedule';
import { generateDismissalReport } from '../../../lib/dismissalReport';
import { format } from 'date-fns';

interface AbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
  onSave: (absence: Omit<Absence, 'id'>) => void;
}

const AbsenceModal = ({ isOpen, onClose, teacher, onSave }: AbsenceModalProps) => {
  const [absenceType, setAbsenceType] = useState<'absence' | 'delay'>('absence');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [delayTime, setDelayTime] = useState('08:00');
  const [showDismissalReport, setShowDismissalReport] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const absenceData: Omit<Absence, 'id'> = {
        teacher_id: teacher.id,
        start_date: startDate,
        end_date: absenceType === 'absence' ? endDate : undefined,
        type: absenceType,
        delay_time_str: absenceType === 'delay' ? delayTime : undefined,
      };

      await onSave(absenceData);

      if (absenceType === 'absence') {
        setShowDismissalReport(true);
      } else {
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de l\'absence');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dismissalReport = showDismissalReport ? generateDismissalReport({
    teacherName: teacher.name,
    startDate,
    endDate,
    specialty: teacher.subjects[0] || '',
  }) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gérer l'absence - {teacher.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={absenceType}
              onChange={(e) => setAbsenceType(e.target.value as 'absence' | 'delay')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              disabled={isSubmitting}
            >
              <option value="absence">Absence</option>
              <option value="delay">Retard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Date de début</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
              disabled={isSubmitting}
            />
          </div>

          {absenceType === 'absence' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Date de fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          {absenceType === 'delay' && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Heure d'arrivée prévue</label>
              <input
                type="time"
                value={delayTime}
                onChange={(e) => setDelayTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>

        {dismissalReport && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium mb-2">Rapport de renvoi</h3>
            <div className="space-y-2 text-sm">
              {dismissalReport.affectedClasses.map((classInfo, index) => (
                <div key={index} className="p-2 bg-white rounded border">
                  <p className="font-medium">{classInfo.className}</p>
                  <p className="text-gray-600">Périodes: {classInfo.periods.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbsenceModal;