import React from 'react';
import { X, Mail, Phone, BookOpen } from 'lucide-react';
import type { Teacher } from '../../types/schedule';

interface TeacherInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher;
}

const TeacherInfoModal = ({ isOpen, onClose, teacher }: TeacherInfoModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Fiche Professeur</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">{teacher.name}</h3>
            {teacher.abbreviation && (
              <p className="text-sm text-gray-500">({teacher.abbreviation})</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <a href={`mailto:${teacher.email}`} className="text-blue-600 hover:underline">
                {teacher.email}
              </a>
            </div>

            {teacher.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <a href={`tel:${teacher.phone}`} className="text-blue-600 hover:underline">
                  {teacher.phone}
                </a>
              </div>
            )}

            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="font-medium mb-1">Matières enseignées :</p>
                <ul className="list-disc list-inside space-y-1">
                  {teacher.subjects.map((subject, index) => (
                    <li key={index} className="text-gray-600">{subject}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherInfoModal;