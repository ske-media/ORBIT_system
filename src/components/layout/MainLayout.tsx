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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between h-16 items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="flex items-center">
                <FolderKanban className="h-8 w-8 text-indigo-600" />
                <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Orbit CRM</h1>
              </Link>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
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
          {/* Mobile menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg rounded-b-lg z-50">
              <nav className="px-4 py-3">
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <li key={item.name}>
                        <Link
                          to={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
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
                  <li>
                    <button
                      onClick={() => {
                        supabase.auth.signOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md"
                    >
                      <LogOut className="h-5 w-5 mr-3 text-gray-400" />
                      Se déconnecter
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6">
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
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}