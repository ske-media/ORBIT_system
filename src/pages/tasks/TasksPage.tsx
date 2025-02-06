import React from 'react';
import { Task, TaskFormData } from '../../types/task';
import { Project } from '../../types/project';
import { TaskList } from '../../components/tasks/TaskList';
import { TaskForm } from '../../components/tasks/TaskForm';
import { Plus, CheckSquare } from 'lucide-react';
import { Notification } from '../../components/ui/Notification';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { supabase } from '../../lib/supabase';

interface TasksPageProps {
  projects: Project[];
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function TasksPage({ projects, tasks, setTasks }: TasksPageProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<Task | undefined>();
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    setTasks(data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      dueDate: task.due_date,
      status: task.status,
      projectId: task.project_id,
      assignedUserIds: task.assigned_user_ids,
      createdAt: task.created_at,
      updatedAt: task.updated_at
    })));
  };

  const handleCreateTask = async (data: TaskFormData) => {
    const { data: newTask, error } = await supabase
      .from('tasks')
      .insert([{
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        status: data.status,
        project_id: data.projectId,
        assigned_user_ids: data.assignedUserIds
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      setError('Erreur lors de la création de la tâche : ' + error.message);
      return;
    }

    const task: Task = {
      id: newTask.id,
      title: newTask.title,
      description: newTask.description,
      dueDate: newTask.due_date,
      status: newTask.status,
      projectId: newTask.project_id,
      assignedUserIds: newTask.assigned_user_ids,
      createdAt: newTask.created_at,
      updatedAt: newTask.updated_at
    };

    setTasks((prev) => [task, ...prev]);
    setSuccess('Tâche créée avec succès');
    setIsFormOpen(false);
  };

  const handleUpdateTask = async (data: TaskFormData) => {
    if (!editingTask) return;
    
    const { data: updatedTask, error } = await supabase
      .from('tasks')
      .update({
        title: data.title,
        description: data.description,
        due_date: data.dueDate,
        status: data.status,
        project_id: data.projectId,
        assigned_user_ids: data.assignedUserIds
      })
      .eq('id', editingTask.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      setError('Erreur lors de la mise à jour de la tâche : ' + error.message);
      return;
    }

    const task: Task = {
      id: updatedTask.id,
      title: updatedTask.title,
      description: updatedTask.description,
      dueDate: updatedTask.due_date,
      status: updatedTask.status,
      projectId: updatedTask.project_id,
      assignedUserIds: updatedTask.assigned_user_ids,
      createdAt: updatedTask.created_at,
      updatedAt: updatedTask.updated_at
    };

    setTasks((prev) =>
      prev.map((task) =>
        task.id === editingTask.id ? updatedTask : task
      )
    );
    setSuccess('Tâche mise à jour avec succès');
    setSuccess('Tâche mise à jour avec succès');
    setEditingTask(undefined);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };


  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;

    // Vérifier si la tâche est associée à un projet
    const { data: taskData, error: taskError } = await supabase
      .from('tasks')
      .select('project_id, id')
      .eq('id', id)
      .maybeSingle();

    if (taskError) {
      console.error('Error checking task:', taskError);
      setError('Une erreur est survenue lors de la vérification de la tâche');
      return;
    }

    if (taskData?.project_id) {
      // Mettre à jour le projet associé
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', taskData.project_id);

      if (projectError) {
        console.error('Error updating project:', projectError);
      }
    }

    // If task doesn't exist, consider it already deleted
    if (!taskData) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
      setSuccess('Tâche supprimée avec succès');
      setConfirmDelete(null);
      return;
    }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting task:', error);
        setError('Erreur lors de la suppression de la tâche : ' + error.message);
        return setConfirmDelete(null);
      }

      setTasks((prev) => prev.filter((task) => task.id !== id));
      setSuccess('Tâche supprimée avec succès');
  };

  return (
    <div>
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

      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <CheckSquare className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Task
          </button>
        </div>

        {(isFormOpen || editingTask) && (
          <div className="mb-6">
            <TaskForm
              projects={projects}
              initialData={editingTask}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingTask(undefined);
              }}
            />
          </div>
        )}

        <TaskList
          tasks={tasks}
          projects={projects}
          onEdit={setEditingTask}
          onDelete={handleDeleteClick}
        />

        <ConfirmDialog
          isOpen={confirmDelete !== null}
          title="Supprimer la tâche"
          message="Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          type="danger"
        />
    </div>
  );
}