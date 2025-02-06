import React from 'react';
import { Project } from '../../types/project';
import { Task } from '../../types/task';
import { Contact } from '../../types/contact';
import { Quote, Invoice } from '../../types/finance';
import { ProjectSummary } from '../../components/dashboard/ProjectSummary';
import { TaskSummary } from '../../components/dashboard/TaskSummary';
import { DashboardStats } from '../../components/dashboard/DashboardStats';
import { DailyBriefing } from '../../components/dashboard/DailyBriefing';
import { LayoutDashboard } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardPageProps {
  projects: Project[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  contacts: Contact[];
}

export function DashboardPage({ projects, tasks, setTasks, contacts }: DashboardPageProps) {
  const [quotes, setQuotes] = React.useState<Quote[]>([]);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);

  const handleTaskComplete = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .update({ status: 'done' })
      .eq('id', taskId);
    
    if (error) {
      console.error('Error completing task:', error);
      return;
    }

    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status: 'done' }
        : task
    ));
  };

  React.useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    // Charger les devis
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*');
    
    if (quotesError) {
      console.error('Error loading quotes:', quotesError);
    } else {
      setQuotes(quotesData.map(quote => ({
        id: quote.id,
        contactId: quote.contact_id,
        projectId: quote.project_id,
        quoteDate: quote.quote_date,
        status: quote.status,
        totalAmount: quote.total_amount,
        createdAt: quote.created_at,
        updatedAt: quote.updated_at
      })));
    }

    // Charger les factures
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*');
    
    if (invoicesError) {
      console.error('Error loading invoices:', invoicesError);
    } else {
      setInvoices(invoicesData.map(invoice => ({
        id: invoice.id,
        contactId: invoice.contact_id,
        projectId: invoice.project_id,
        invoiceDate: invoice.invoice_date,
        status: invoice.status,
        totalAmount: invoice.total_amount,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      })));
    }
  };

  return (
    <div>
      <div className="flex items-center mb-8">
        <LayoutDashboard className="h-8 w-8 text-indigo-600 mr-3" />
        <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
      </div>
      
      <DailyBriefing
        tasks={tasks}
        projects={projects}
        invoices={invoices}
        onTaskComplete={handleTaskComplete} 
      />

      <DashboardStats
        invoices={invoices}
        quotes={quotes}
        contacts={contacts}
        projects={projects}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectSummary projects={projects} />
        <TaskSummary tasks={tasks} projects={projects} />
      </div>
    </div>
  );
}