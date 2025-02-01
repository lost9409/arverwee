import React, { useState, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Calendar } from 'lucide-react';
import type { Teacher, Absence } from '../../types/schedule';
import AbsenceModal from './modals/AbsenceModal';
import AddTeacherModal from './modals/AddTeacherModal';
import { useData } from '../../context/DataContext';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const TeacherManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAbsenceModalOpen, setIsAbsenceModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = useState(false);
  const { teachers, updateTeacher, addTeacher, deleteTeacher, addAbsence, absences, deleteAbsence } = useData();

  const handleAbsenceClick = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsAbsenceModalOpen(true);
  };

  const handleAddTeacher = () => {
    setSelectedTeacher(null);
    setIsAddTeacherModalOpen(true);
  };

  const handleSaveTeacher = useCallback(async (teacherData: Omit<Teacher, 'id'>) => {
    try {
      if (selectedTeacher) {
        await updateTeacher(selectedTeacher.id, { ...selectedTeacher, ...teacherData });
      } else {
        await addTeacher(teacherData);
      }
      setIsAddTeacherModalOpen(false);
    } catch (error: any) {
      if (error.code === '23505') {
        alert('Un professeur avec cet email existe déjà.');
      } else {
        alert('Une erreur est survenue lors de l\'enregistrement du professeur.');
      }
    }
  }, [selectedTeacher, updateTeacher, addTeacher]);

  const handleEditTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setIsAddTeacherModalOpen(true);
  };

  const handleDeleteTeacher = async (teacher: Teacher) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le professeur ${teacher.name} ?`)) {
      try {
        await deleteTeacher(teacher.id);
      } catch (error) {
        console.error('Erreur lors de la suppression du professeur:', error);
        alert('Une erreur est survenue lors de la suppression du professeur');
      }
    }
  };

  const handleSaveAbsence = async (absence: Omit<Absence, 'id'>) => {
    try {
      await addAbsence(absence);
      setIsAbsenceModalOpen(false);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'absence:', error);
      alert('Une erreur est survenue lors de l\'enregistrement de l\'absence');
    }
  };

  const handleDeleteAbsence = async (absenceId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      try {
        await deleteAbsence(absenceId);
      } catch (error) {
        console.error('Erreur lors de la suppression de l\'absence:', error);
        alert('Une erreur est survenue lors de la suppression de l\'absence');
      }
    }
  };

  // Filtrer les absences pour le professeur sélectionné
  const getTeacherAbsences = (teacherId: string) => {
    return absences.filter(absence => absence.teacher_id === teacherId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestion des Professeurs</h1>
        <button
          onClick={handleAddTeacher}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Ajouter un Professeur
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher des professeurs..."
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
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Abréviation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matières
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {teachers
              .filter(teacher => 
                teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((teacher) => {
                const teacherAbsences = getTeacherAbsences(teacher.id);
                return (
                  <React.Fragment key={teacher.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{teacher.abbreviation || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{teacher.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{teacher.phone || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {teacher.subjects?.join(', ') || 'Aucune matière assignée'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleAbsenceClick(teacher)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Gérer les absences"
                          >
                            <Calendar className="w-5 h-5" />
                          </button>
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="Envoyer un email"
                          >
                            <Mail className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditTeacher(teacher)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeacher(teacher)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {teacherAbsences.length > 0 && (
                      <tr className="bg-gray-50">
                        <td colSpan={6} className="px-6 py-2">
                          <div className="text-sm text-gray-600">
                            <p className="font-medium mb-1">Absences enregistrées :</p>
                            <div className="space-y-1">
                              {teacherAbsences.map(absence => (
                                <div key={absence.id} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${
                                      absence.type === 'absence' ? 'bg-red-500' : 'bg-yellow-500'
                                    }`} />
                                    {absence.type === 'absence' ? (
                                      <span>
                                        Du {format(parseISO(absence.start_date), 'dd/MM/yyyy', { locale: fr })}
                                        {absence.end_date && ` au ${format(parseISO(absence.end_date), 'dd/MM/yyyy', { locale: fr })}`}
                                      </span>
                                    ) : (
                                      <span>
                                        Retard le {format(parseISO(absence.start_date), 'dd/MM/yyyy', { locale: fr })} - 
                                        Arrivée prévue à {absence.delay_time_str}
                                      </span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => handleDeleteAbsence(absence.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Supprimer l'absence"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
          </tbody>
        </table>
      </div>

      {selectedTeacher && (
        <AbsenceModal
          isOpen={isAbsenceModalOpen}
          onClose={() => setIsAbsenceModalOpen(false)}
          teacher={selectedTeacher}
          onSave={handleSaveAbsence}
        />
      )}

      <AddTeacherModal
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onSave={handleSaveTeacher}
        teacher={selectedTeacher}
      />
    </div>
  );
};

export default TeacherManagement;