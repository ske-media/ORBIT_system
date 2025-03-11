import React from 'react';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { User } from '../../types/user';
import { Edit, Trash2, CheckSquare, Calendar, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TaskListProps {
  tasks: Task[];
  projects: Project[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

interface UserCache {
  [key: string]: User;
}

export function TaskList({ tasks, projects, onEdit, onDelete }: TaskListProps) {
  const [users, setUsers] = React.useState<UserCache>({});

  React.useEffect(() => {
    // Initialize with minimal user info
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

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };

  const getAssignedUsers = (userIds: string[]) => {
    return userIds
      .map(id => users[id])
      .filter(Boolean)
      .map(user => user.name)
      .join(', ');
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      todo: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800',
    };
    return colors[status];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {tasks.map((task) => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 min-w-[200px]">
                <div className="flex items-center">
                  <CheckSquare className="h-5 w-5 text-indigo-500 mr-3" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500">{task.description}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-gray-900">{getProjectName(task.projectId)}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{getAssignedUsers(task.assignedUserIds)}</span>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{formatDate(task.dueDate)}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(task)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}