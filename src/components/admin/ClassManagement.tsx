import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Users } from 'lucide-react';
import type { Class } from '../../types/schedule';
import AddClassModal from './modals/AddClassModal';
import { useData } from '../../context/DataContext';
import StudentListModal from './modals/StudentListModal';

const ClassManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const { classes, updateClass, addClass, deleteClass } = useData();

  const handleAddClass = () => {
    setSelectedClass(null);
    setIsAddClassModalOpen(true);
  };

  const handleSaveClass = async (classData: Omit<Class, 'id'>) => {
    try {
      if (selectedClass) {
        await updateClass(selectedClass.id, {
          ...selectedClass,
          ...classData
        });
      } else {
        await addClass(classData);
      }
      setIsAddClassModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la classe:', error);
      alert('Une erreur est survenue lors de la sauvegarde de la classe');
    }
  };

  const handleEditClass = (cls: Class) => {
    setSelectedClass(cls);
    setIsAddClassModalOpen(true);
  };

  const handleDeleteClass = async (cls: Class) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la classe ${cls.name} ?`)) {
      try {
        await deleteClass(cls.id);
      } catch (error) {
        console.error('Erreur lors de la suppression de la classe:', error);
        alert('Une erreur est survenue lors de la suppression de la classe');
      }
    }
  };

  const handleViewStudents = (cls: Class) => {
    setSelectedClass(cls);
    setIsStudentListModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Classes</h1>
        <button 
          onClick={handleAddClass}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Ajouter une Classe
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des classes..."
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
                Nom de la Classe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Niveau
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Élèves
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Majeurs (18+)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {classes
              .filter(classItem => classItem.name.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{classItem.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{classItem.level}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleViewStudents(classItem)}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Users className="w-4 h-4" />
                      {classItem.student_count || 0} Élèves
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{classItem.adult_count || 0}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleEditClass(classItem)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Modifier"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem)}
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

      {isAddClassModalOpen && (
        <AddClassModal
          isOpen={isAddClassModalOpen}
          onClose={() => setIsAddClassModalOpen(false)}
          onSave={handleSaveClass}
          cls={selectedClass}
        />
      )}

      {isStudentListModalOpen && selectedClass && (
        <StudentListModal
          isOpen={isStudentListModalOpen}
          onClose={() => setIsStudentListModalOpen(false)}
          classItem={selectedClass}
        />
      )}
    </div>
  );
};

export default ClassManagement;