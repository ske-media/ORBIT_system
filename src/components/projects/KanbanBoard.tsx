import React from 'react';
import { Task, TaskFormData } from '../../types/task';
import { Calendar, Users, AlertCircle, Clock, Plus } from 'lucide-react';
import { User } from '../../types/user';
import { supabase } from '../../lib/supabase';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
  onUpdateTask: (taskId: string, status: Task['status']) => void;
  onCreateTask: (data: TaskFormData) => void;
}

interface UserCache {
  [key: string]: User;
}

interface ColumnStats {
  total: number;
  overdue: number;
}

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: Task['status'];
  projectId: string;
  stats: ColumnStats;
  onDrop: (taskId: string) => void;
  onCreateTask: (status: Task['status']) => void;
}

function KanbanColumn({ title, tasks, status, projectId, stats, onDrop, onCreateTask }: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const newStatus = status;
    onDrop(taskId, newStatus);
  };

  const getColumnColor = (status: Task['status']) => {
    const colors = {
      todo: 'bg-yellow-50 border-yellow-200',
      in_progress: 'bg-blue-50 border-blue-200',
      done: 'bg-green-50 border-green-200',
    };
    return colors[status];
  };

  return (
    <div
      className={`flex flex-col rounded-lg ${getColumnColor(status)} border p-4 min-h-[50vh]`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <div className="flex items-center space-x-2">
            {stats.overdue > 0 && (
              <span className="flex items-center text-xs text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                {stats.overdue} en retard
              </span>
            )}
            <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {stats.total}
            </span>
          </div>
        </div>
        
        <button
          onClick={() => onCreateTask(status)}
          className="w-full flex items-center justify-center p-2 mb-4 text-sm text-gray-600 bg-white border border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Ajouter une tâche
        </button>
        
        <div className="flex-1 space-y-3">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

function KanbanCard({ task }: { task: Task }) {
  const [users, setUsers] = React.useState<UserCache>({});
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    // Initialize with minimal user info - we don't need to actually load all users
    // for the kanban card, since we're just using it for display
    const userCache: UserCache = {};
    
    // Get current user at minimum
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        userCache[data.user.id] = {
          id: data.user.id,
          name: data.user.email?.split('@')[0] || 'Current User',
          email: data.user.email || '',
          role: (data.user.user_metadata?.role as 'admin' | 'user') || 'user',
          createdAt: data.user.created_at,
          updatedAt: data.user.last_sign_in_at || data.user.created_at
        };
        setUsers(userCache);
      }
    }).catch(error => {
      console.error('Error getting current user:', error);
    });
  }, []);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const getAssignedUsers = (userIds: string[]) => {
    return userIds
      .map(id => users[id])
      .filter(Boolean)
      .map(user => user.name)
      .join(', ');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const isOverdue = (date: string) => {
    return new Date(date) < new Date() && task.status !== 'done';
  };

  const getDueDateColor = () => {
    if (task.status === 'done') return 'text-green-500';
    return isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-500';
  };

  return (
    <div
      draggable
      className={`group bg-white rounded-md shadow p-3 cursor-move hover:shadow-md transition-all duration-200 hover:scale-[1.02] border border-transparent hover:border-indigo-100 ${
        isDragging ? 'opacity-50' : ''
      }`}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className={`flex items-center ${getDueDateColor()}`}>
          {isOverdue(task.dueDate) ? (
            <Clock className="h-3 w-3 mr-1" />
          ) : (
            <Calendar className="h-3 w-3 mr-1" />
          )}
          {formatDate(task.dueDate)}
        </div>
        <div className="flex items-center">
          <Users className="h-3 w-3 mr-1" />
          {task.assignedUserIds.length}
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, projectId, onUpdateTask, onCreateTask }: KanbanBoardProps) {
  const columns = [
    { title: 'À faire', status: 'todo' as const, color: 'yellow', description: 'Tâches en attente' },
    { title: 'En cours', status: 'in_progress' as const, color: 'blue', description: 'Tâches en cours de réalisation' },
    { title: 'Terminé', status: 'done' as const, color: 'green', description: 'Tâches terminées' },
  ];

  const getColumnStats = (columnTasks: Task[]): ColumnStats => {
    return {
      total: columnTasks.length,
      overdue: columnTasks.filter(task => 
        new Date(task.dueDate) < new Date() && task.status !== 'done'
      ).length
    };
  };

  const [isDragging, setIsDragging] = React.useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.status} className="flex flex-col">
          <div className={`h-1 bg-${column.color}-400 rounded-t-md mb-2`} />
          <KanbanColumn
            title={column.title}
            status={column.status}
            projectId={projectId}
            stats={getColumnStats(tasks.filter((task) => task.status === column.status))}
            tasks={tasks.filter((task) => task.status === column.status)}
            onDrop={(taskId, newStatus) => onUpdateTask(taskId, newStatus)}
            onCreateTask={(status) => {
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              onCreateTask({
                title: '',
                description: '',
                dueDate: tomorrow.toISOString().split('T')[0],
                status: status,
                projectId: projectId,
                assignedUserIds: []
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}