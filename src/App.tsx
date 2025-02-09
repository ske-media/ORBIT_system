import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { SignupPage } from './pages/auth/SignupPage';
import { PasswordResetPage } from './pages/auth/PasswordResetPage';
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

  const loadInitialData = async () => {
    console.log('Loading initial data...');

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
      return;
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
      return;
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
      return;
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
      return;
    } else {
      setCompanies(companiesData);
    }

    // Load invoices
    const { data: invoicesData, error: invoicesError } = await retryableQuery(() =>
      supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (invoicesError) {
      console.error('Error loading invoices:', invoicesError);
      return;
    }

    setInvoices(invoicesData);

    // Load quotes
    const { data: quotesData, error: quotesError } = await retryableQuery(() =>
      supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (quotesError) {
      console.error('Error loading quotes:', quotesError);
      return;
    }

    setQuotes(quotesData);

    // Load payments
    const { data: paymentsData, error: paymentsError } = await retryableQuery(() =>
      supabase
        .from('invoice_payments')
        .select('*')
        .order('created_at', { ascending: false })
    );

    if (paymentsError) {
      console.error('Error loading payments:', paymentsError);
      return;
    }

    setPayments(paymentsData);

    console.log('Initial data loaded successfully');
  };

  // Load initial data when session changes
  React.useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data when session is available
  React.useEffect(() => {
    if (session) {
      loadInitialData();
    }
  }, [session]);

  if (!session) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/password-reset" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <RequireAuth>
              <MainLayout />
            </RequireAuth>
          }
        >
          <Route index element={<DashboardPage projects={projects} tasks={tasks} contacts={contacts} setTasks={setTasks} />} />
          <Route path="contacts" element={<ContactsPage contacts={contacts} setContacts={setContacts} companies={companies} setCompanies={setCompanies} />} />
          <Route path="projects" element={<ProjectsPage contacts={contacts} tasks={tasks} setTasks={setTasks} projects={projects} setProjects={setProjects} />} />
          <Route path="tasks" element={<TasksPage projects={projects} tasks={tasks} setTasks={setTasks} />} />
          <Route path="finance" element={<FinancePage contacts={contacts} projects={projects} companies={companies} invoices={invoices} quotes={quotes} payments={payments} setInvoices={setInvoices} setQuotes={setQuotes} setPayments={setPayments} />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;