import React from 'react';
import { Calendar, Users, BookOpen, School } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format, isToday, isFuture, parseISO, isWithinInterval, addDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useData } from '../../context/DataContext';

const AdminDashboard = () => {
  const { absences, teachers } = useData();
  const today = new Date();

  const cards = [
    {
      title: 'Gestion des Professeurs',
      icon: Users,
      description: 'Gérer les professeurs, les absences et les remplacements',
      link: '/admin/teachers',
      color: 'bg-blue-500',
    },
    {
      title: 'Gestion des Locaux',
      icon: BookOpen,
      description: 'Gérer les salles de classe et les installations',
      link: '/admin/rooms',
      color: 'bg-green-500',
    },
    {
      title: 'Gestion des Classes',
      icon: School,
      description: 'Gérer les classes et les groupes d\'élèves',
      link: '/admin/classes',
      color: 'bg-purple-500',
    },
    {
      title: 'Aperçu des Horaires',
      icon: Calendar,
      description: 'Voir et gérer tous les horaires',
      link: '/admin/schedule',
      color: 'bg-orange-500',
    },
  ];

  // Filtrer les absences
  const longTermAbsences = absences.filter(absence => {
    if (absence.type !== 'absence' || !absence.end_date) return false;
    const endDate = parseISO(absence.end_date);
    return isFuture(endDate) && isWithinInterval(today, {
      start: parseISO(absence.start_date),
      end: endDate
    });
  });

  const todayAbsences = absences.filter(absence => {
    if (absence.type !== 'absence') return false;
    const startDate = parseISO(absence.start_date);
    const endDate = absence.end_date ? parseISO(absence.end_date) : startDate;
    return isToday(startDate) || (isWithinInterval(today, {
      start: startDate,
      end: endDate
    }));
  });

  const todayDelays = absences.filter(absence => 
    absence.type === 'delay' && 
    isToday(parseISO(absence.start_date))
  );

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Professeur inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Administration</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className="block group hover:shadow-lg transition-all duration-200"
            >
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
                <div className={`${card.color} p-4 flex justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Absences longue durée */}
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <h2 className="text-xl font-semibold mb-4">Absences Longue Durée</h2>
          <div className="space-y-4">
            {longTermAbsences.length > 0 ? (
              longTermAbsences.map((absence) => (
                <div key={absence.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-medium text-red-800">{getTeacherName(absence.teacher_id)}</p>
                  <p className="text-sm text-red-600">
                    Du {format(parseISO(absence.start_date), 'dd/MM/yyyy', { locale: fr })} au{' '}
                    {format(parseISO(absence.end_date!), 'dd/MM/yyyy', { locale: fr })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Aucune absence longue durée</p>
            )}
          </div>
        </div>

        {/* Absences du jour */}
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <h2 className="text-xl font-semibold mb-4">Absences du Jour</h2>
          <div className="space-y-4">
            {todayAbsences.length > 0 ? (
              todayAbsences.map((absence) => (
                <div key={absence.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-800">{getTeacherName(absence.teacher_id)}</p>
                  <p className="text-sm text-orange-600">
                    {absence.end_date ? (
                      `Jusqu'au ${format(parseISO(absence.end_date), 'dd/MM/yyyy', { locale: fr })}`
                    ) : (
                      'Toute la journée'
                    )}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Aucune absence aujourd'hui</p>
            )}
          </div>
        </div>

        {/* Retards du jour */}
        <div className="bg-white rounded-lg shadow overflow-hidden p-6">
          <h2 className="text-xl font-semibold mb-4">Retards du Jour</h2>
          <div className="space-y-4">
            {todayDelays.length > 0 ? (
              todayDelays.map((delay) => (
                <div key={delay.id} className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-800">{getTeacherName(delay.teacher_id)}</p>
                  <p className="text-sm text-yellow-600">
                    Arrivée prévue à {delay.delay_time_str}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">Aucun retard signalé</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;