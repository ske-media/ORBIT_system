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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const session = supabase.auth.getSession();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <FolderKanban className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Orbit CRM</h1>
              </Link>
            </div>
            <div className="flex md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => supabase.auth.signOut()}
                className="hidden md:flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } flex items-center px-3 py-2 rounded-md text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={() => {
                supabase.auth.signOut();
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
            >
              <LogOut className="h-5 w-5 mr-3 text-gray-400" />
              Se déconnecter
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-2 sm:px-4 lg:px-8">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="hidden md:block w-64 flex-shrink-0">
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