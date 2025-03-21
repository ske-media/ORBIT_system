import React from 'react';
import { Task, TaskFormData, TaskStatus } from '../../types/task';
import { Project } from '../../types/project';
import { User } from '../../types/user';
import { supabase } from '../../lib/supabase';

interface TaskFormProps {
  projects: Project[];
  initialData?: Task;
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
}

interface UserCache {
  [key: string]: User;
}

export function TaskForm({ projects, initialData, onSubmit, onCancel }: TaskFormProps) {
  const [users, setUsers] = React.useState<UserCache>({});

  React.useEffect(() => {
    // Initialize with minimal user info
    const userCache: UserCache = {};
    
    // Get current user
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

  const [formData, setFormData] = React.useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'todo',
    projectId: initialData?.projectId || '',
    assignedUserIds: initialData?.assignedUserIds || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUserSelection = (userId: string) => {
    setFormData((prev) => ({
      ...prev,
      assignedUserIds: prev.assignedUserIds.includes(userId)
        ? prev.assignedUserIds.filter(id => id !== userId)
        : [...prev.assignedUserIds, userId],
    }));
  };

  const statuses: TaskStatus[] = ['todo', 'in_progress', 'done'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          name="description"
          id="description"
          rows={3}
          value={formData.description || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
          Project
        </label>
        <select
          name="projectId"
          id="projectId"
          required
          value={formData.projectId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Assigned Users
        </label>
        <div className="space-y-2">
          {Object.entries(users).map(([userId, user]) => (
            <label key={userId} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.assignedUserIds.includes(userId)}
                onChange={() => handleUserSelection(userId)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-900">{user.name}</span>
            </label>
          ))}
          {Object.keys(users).length === 0 && (
            <p className="text-sm text-gray-500">
              Assign to yourself (current user) by default
            </p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          name="dueDate"
          id="dueDate"
          required
          value={formData.dueDate.split('T')[0]}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          name="status"
          id="status"
          required
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}