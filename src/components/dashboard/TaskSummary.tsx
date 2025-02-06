import React from 'react';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { CheckSquare, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TaskSummaryProps {
  tasks: Task[];
  projects: Project[];
}

export function TaskSummary({ tasks, projects }: TaskSummaryProps) {
  const navigate = useNavigate();
  const incompleteTasks = tasks.filter(task => task.status !== 'done')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Projet inconnu';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getStatusColor = (status: Task['status']) => {
    const colors = {
      todo: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <CheckSquare className="h-6 w-6 text-indigo-600 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Tâches à faire</h2>
        </div>
        <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
          {incompleteTasks.length}
        </span>
      </div>

      <div className="space-y-3">
        {incompleteTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">Aucune tâche en attente</p>
        ) : (
          incompleteTasks.map(task => (
            <div 
              key={task.id} 
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => navigate(`/tasks`)}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ')}
                  </span>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {task.title}
                  </span>
                </div>
                <div className="mt-1 flex items-center space-x-3">
                  <span className="text-sm text-gray-500 truncate">
                    {getProjectName(task.projectId)}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(task.dueDate)}
                  </span>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}