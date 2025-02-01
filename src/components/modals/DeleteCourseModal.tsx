import React from 'react';
import { X } from 'lucide-react';

interface DeleteCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (deleteRecurring: boolean) => void;
}

const DeleteCourseModal = ({ isOpen, onClose, onDelete }: DeleteCourseModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Supprimer le cours</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          Comment souhaitez-vous supprimer ce cours ?
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onDelete(false)}
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Supprimer uniquement ce cours
          </button>
          <button
            onClick={() => onDelete(true)}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Supprimer tous les cours de cette plage horaire jusqu'à la fin de l'année
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCourseModal;