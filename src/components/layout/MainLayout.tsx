import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, FolderKanban, CheckSquare, LogOut, Receipt, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../hooks/useTheme';

const navigation = [
  { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Projets', href: '/projects', icon: FolderKanban },
  { name: 'Tâches', href: '/tasks', icon: CheckSquare },
  { name: 'Finance', href: '/finance', icon: Receipt },
  { name: 'Paramètres', href: '/settings', icon: Settings },
];

export function MainLayout() {
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const session = supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <FolderKanban className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Orbit CRM</h1>
              </Link>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        }`}
                      >
                        <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}