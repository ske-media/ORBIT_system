import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { ContactsPage } from './pages/contacts/ContactsPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { FinancePage } from './pages/finance/FinancePage';
import { SettingsPage } from './pages/settings/SettingsPage';
import { Session } from '@supabase/supabase-js';
import { supabase, retryableQuery } from './lib/supabase';
import { Project } from './types/project';
import { Task } from './types/task';
import { Contact } from './types/contact';
import { Company } from './types/company';
import { Invoice, Quote, Payment } from './types/finance';
import { useTheme } from './hooks/useTheme';

// Auth guard component
function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

function App() {
  const { isDarkMode } = useTheme();
  const [session, setSession] = React.useState<Session | null>(null);
  const [authError, setAuthError] = React.useState<string | null>(null);
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [payments, setPayments] = React.useState<Payment[]>([]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    
    if (session) {
      loadInitialData();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadInitialData();
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const loadInitialData = async () => {
    // Load projects
    const { data: projectsData, error: projectsError } = await retryableQuery(() =>
      supabase
        .from('projects')
        .select(`
          *,
          contact:contacts(*)
        `)
        .order('created_at', { ascending: false })
    );
    
    if (projectsError) {
      console.error('Error loading projects:', projectsError);
    } else {
      setProjects(projectsData.map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        progress: project.progress,
        status: project.status,
        contactId: project.contact_id,
        contact: project.contact,
        createdAt: project.created_at,
        updatedAt: project.updated_at
      })));
    }

    // Load tasks
    const { data: tasksData, error: tasksError } = await retryableQuery(() =>
      supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
    );
    
    if (tasksError) {
      console.error('Error loading tasks:', tasksError);
    } else {
      setTasks(tasksData);
    }

    // Load contacts
    const { data: contactsData, error: contactsError } = await retryableQuery(() =>
      supabase
        .from('contacts')
        .select(`
          *,
          company:companies(*)
        `)
        .order('created_at', { ascending: false })
    );
    
    if (contactsError) {
      console.error('Error loading contacts:', contactsError);
    } else {
      setContacts(contactsData.map(contact => ({
        id: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        email: contact.email,
        phone: contact.phone,
        companyId: contact.company_id,
        company: contact.company,
        temperature: contact.temperature,
        createdAt: contact.created_at,
        updatedAt: contact.updated_at
      })));
    }

    // Load companies
    const { data: companiesData, error: companiesError } = await retryableQuery(() =>
      supabase
        .from('companies')
        .select('*')
        .order('name')
    );
    
    if (companiesError) {
      console.error('Error loading companies:', companiesError);
    } else {
      setCompanies(companiesData);
    }
  };

  if (!session) {
    const handleLogin = async () => {
      setAuthError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: 'demo@example.com',
        password: 'demo123'
      });

      if (error) {
        setAuthError('Erreur de connexion. Veuillez réessayer.');
        console.error('Login error:', error);
      }
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8 rounded-lg shadow-md bg-white dark:bg-gray-800">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Connexion requise</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Veuillez vous connecter pour accéder à l'application
            </p>
          </div>
          {authError && (
            <div className="mt-2 text-sm text-red-600 text-center">
              {authError}
            </div>
          )}
          <div>
            <button
              onClick={handleLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          session ? <Navigate to="/" replace /> : (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                  <h2 className="text-3xl font-extrabold text-gray-900">Connexion requise</h2>
                  <p className="mt-2 text-sm text-gray-600">
                    Veuillez vous connecter pour accéder à l'application
                  </p>
                </div>
                {authError && (
                  <div className="mt-2 text-sm text-red-600 text-center">
                    {authError}
                  </div>
                )}
                <div>
                  <button
                    onClick={() => handleLogin()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Se connecter
                  </button>
                </div>
              </div>
            </div>
          )
        } />

        {/* Protected routes */}
        <Route path="/" element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }>
          <Route index element={
            <DashboardPage 
              projects={projects} 
              tasks={tasks} 
              contacts={contacts}
              setTasks={setTasks}
            />
          } />
          <Route path="contacts" element={
            <ContactsPage 
              contacts={contacts} 
              setContacts={setContacts}
              companies={companies}
              setCompanies={setCompanies}
            />
          } />
          <Route path="projects" element={
            <ProjectsPage 
              contacts={contacts} 
              tasks={tasks} 
              setTasks={setTasks} 
              projects={projects} 
              setProjects={setProjects} 
            />
          } />
          <Route path="tasks" element={
            <TasksPage projects={projects} tasks={tasks} setTasks={setTasks} />
          } />
          <Route path="finance" element={
            <FinancePage 
              contacts={contacts} 
              projects={projects}
              companies={companies}
              invoices={invoices}
              quotes={quotes}
              payments={payments}
              setInvoices={setInvoices}
              setQuotes={setQuotes}
              setPayments={setPayments}
            />
          } />
          <Route path="settings" element={
            <SettingsPage />
          } />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;