import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Calendar, Users, BookOpen, School, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const links = [
    { to: '/', icon: Calendar, label: 'Horaire' },
    { to: '/admin', icon: Settings, label: 'Administration', adminOnly: true },
    { to: '/admin/teachers', icon: Users, label: 'Professeurs', adminOnly: true },
    { to: '/admin/rooms', icon: BookOpen, label: 'Locaux', adminOnly: true },
    { to: '/admin/classes', icon: School, label: 'Classes', adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col min-h-screen">
      <div className="flex items-center gap-2 mb-8">
        <span className="text-2xl font-bold text-indigo-600">ä</span>
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Aiko</h1>
          <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-indigo-600 bg-indigo-50 rounded-full">
            Beta
          </span>
        </div>
      </div>
      
      <nav className="space-y-2 flex-grow">
        {links.map(({ to, icon: Icon, label, adminOnly }) => {
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors',
                  isActive && 'bg-indigo-50 text-indigo-700'
                )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-6 mt-auto border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          © {new Date().getFullYear()} Kerroudj Ahmed
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;