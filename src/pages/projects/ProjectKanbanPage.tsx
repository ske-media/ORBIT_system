import React from 'react';
import { Task } from '../../types/task';
import { Project } from '../../types/project';
import { KanbanBoard } from '../../components/projects/KanbanBoard';
import { ArrowLeft, KanbanSquare, ListTodo, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Notification } from '../../components/ui/Notification';

interface ProjectKanbanPageProps {
  project: Project;
  tasks: Task[];
  onUpdateTask: (taskId: string, status: Task['status']) => void;
  onBack: () => void;
}

export function ProjectKanbanPage({ project, tasks, onUpdateTask, onBack }: ProjectKanbanPageProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const projectTasks = React.useMemo(() => {
    console.log('Filtering tasks for project:', project.id);
    console.log('Available tasks:', tasks);
    return tasks.filter(task => {
      const matches = task.projectId === project.id;
      console.log('Task:', task.id, 'matches:', matches);
      return matches;
    });
  }, [tasks, project.id]);

  const handleUpdateTask = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      onUpdateTask(taskId, newStatus);
      setSuccess('Tâche mise à jour avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Erreur lors de la mise à jour de la tâche');
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {error && (
          <div className="mb-4">
            <Notification
              type="error"
              message={error}
              onClose={() => setError(null)}
            />
          </div>
        )}

        {success && (
          <div className="mb-4">
            <Notification
              type="success"
              message={success}
              onClose={() => setSuccess(null)}
            />
          </div>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <KanbanSquare className="h-8 w-8 text-indigo-600 mr-3" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
              <div className="flex items-center mt-1">
                <span className="text-sm text-gray-500">Tableau Kanban</span>
                <span className="mx-2 text-gray-300">•</span>
                <span className="flex items-center text-sm text-gray-500">
                  <ListTodo className="h-4 w-4 mr-1" />
                  {projectTasks.length} tâches
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour aux projets
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Description du projet</h2>
              <p className="mt-1 text-sm text-gray-500">{project.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div>
                <div className="text-sm font-medium text-gray-500">Progression</div>
                <div className="mt-1 flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-600">{project.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <KanbanBoard 
          tasks={projectTasks} 
          onUpdateTask={handleUpdateTask} 
        />
      </div>
    </div>
  );
}