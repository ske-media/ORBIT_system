import React from 'react';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { User } from '../../types/user';
import { CheckCircle2, AlertCircle, Clock, Calendar, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DailyBriefingProps {
  tasks: Task[];
  projects: Project[];
  invoices: Invoice[];
  onTaskComplete: (taskId: string) => void;
}

interface UserCache {
  [key: string]: User;
}

export function DailyBriefing({ tasks, projects, invoices, onTaskComplete }: DailyBriefingProps) {
  const [users, setUsers] = React.useState<UserCache>({});

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.error('Error loading users:', error);
      return;
    }

    const userCache: UserCache = {};
    authUsers.forEach(user => {
      userCache[user.id] = {
        id: user.id,
        name: user.email?.split('@')[0] || 'Unknown',
        email: user.email || '',
        role: (user.user_metadata?.role as 'admin' | 'user') || 'user',
        createdAt: user.created_at,
        updatedAt: user.last_sign_in_at || user.created_at
      };
    });
    setUsers(userCache);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  // Get today's tasks
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    const today = new Date();
    return isSameDay(taskDate, today) && task.status !== 'done';
  });

  // Get upcoming project deadlines (next 7 days)
  const upcomingProjects = projects.filter(project => {
    if (project.status === 'completed') return false;
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    if (projectTasks.length === 0) return false;
    
    const nextDeadline = new Date(Math.min(...projectTasks.map(t => new Date(t.dueDate).getTime())));
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    return nextDeadline >= today && nextDeadline <= sevenDaysFromNow;
  });

  // Get pending invoices
  const pendingInvoices = invoices.filter(invoice => 
    invoice.status !== 'paid' && invoice.status !== 'cancelled'
  );

  // Group tasks by assigned user
  const tasksByUser = todayTasks.reduce((acc, task) => {
    task.assignedUserIds.forEach(userId => {
      if (!acc[userId]) acc[userId] = [];
      acc[userId].push(task);
    });
    return acc;
  }, {} as Record<string, Task[]>);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const getProjectUrgencyColor = (project: Project) => {
    const projectTasks = tasks.filter(t => t.projectId === project.id);
    if (projectTasks.length === 0) return 'bg-gray-100 text-gray-800';
    
    const nextDeadline = new Date(Math.min(...projectTasks.map(t => new Date(t.dueDate).getTime())));
    const today = new Date();
    const daysUntilDeadline = Math.ceil((nextDeadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDeadline <= 2) return 'bg-red-100 text-red-800';
    if (daysUntilDeadline <= 4) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getAssignedUsers = (userIds: string[]) => {
    return userIds
      .map(id => users[id])
      .filter(Boolean)
      .map(user => user.name)
      .join(', ');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Briefing Quotidien</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div>
          <div className="flex items-center mb-4">
            <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Tâches du jour</h3>
          </div>
          
          <div className="space-y-6">
            {Object.entries(tasksByUser).map(([userId, userTasks]) => {
              const user = users[userId];
              return (
                <div key={userId} className="space-y-2">
                  <div className="text-sm font-medium text-gray-500">{user?.name || 'Non assigné'}</div>
                  {userTasks.map(task => (
                    <div key={task.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                      <button
                        onClick={() => onTaskComplete(task.id)}
                        className="mt-0.5 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{task.title}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500 truncate">{task.description}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {Object.keys(tasksByUser).length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                Aucune tâche pour aujourd'hui
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Project Deadlines */}
        <div>
          <div className="flex items-center mb-4">
            <AlertCircle className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Échéances à venir</h3>
          </div>
          
          <div className="space-y-3">
            {upcomingProjects.map(project => {
              const projectTasks = tasks.filter(t => t.projectId === project.id);
              const nextDeadline = new Date(Math.min(...projectTasks.map(t => new Date(t.dueDate).getTime())));
              
              return (
                <div key={project.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{project.name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getProjectUrgencyColor(project)}`}>
                      {formatDate(nextDeadline.toISOString())}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="ml-2">{project.progress}%</span>
                  </div>
                </div>
              );
            })}
            {upcomingProjects.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                Aucune échéance à venir
              </div>
            )}
          </div>
        </div>

        {/* Pending Invoices */}
        <div>
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-indigo-600 mr-2" />
            <h3 className="text-sm font-medium text-gray-900">Factures en attente</h3>
          </div>
          
          <div className="space-y-3">
            {pendingInvoices.map(invoice => (
              <div key={invoice.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    Facture #{invoice.id.slice(0, 8)}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Intl.NumberFormat('fr-FR', {
                      style: 'currency',
                      currency: 'EUR'
                    }).format(invoice.totalAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {formatDate(invoice.invoiceDate)}
                  </span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    invoice.status === 'overdue' 
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.status === 'overdue' ? 'En retard' : 
                     invoice.status === 'draft' ? 'Brouillon' :
                     invoice.status === 'sent' ? 'Envoyée' :
                     invoice.status === 'partial_paid' ? 'Partiellement payée' :
                     invoice.status === 'cancelled' ? 'Annulée' : invoice.status}
                  </span>
                </div>
              </div>
            ))}
            {pendingInvoices.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-4">
                Aucune facture en attente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}