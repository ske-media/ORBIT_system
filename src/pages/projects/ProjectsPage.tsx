import React from 'react';
import { Project, ProjectFormData } from '../../types/project';
import { Task } from '../../types/task';
import { Contact } from '../../types/contact';
import { ProjectList } from '../../components/projects/ProjectList';
import { ProjectForm } from '../../components/projects/ProjectForm';
import { ProjectKanbanPage } from './ProjectKanbanPage';
import { Plus, FolderKanban, CheckCircle } from 'lucide-react';
import { Notification } from '../../components/ui/Notification';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { supabase } from '../../lib/supabase';

interface ProjectsPageProps {
  contacts: Contact[];
  tasks: Task[];
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

export function ProjectsPage({ contacts, tasks, projects, setProjects, setTasks }: ProjectsPageProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingProject, setEditingProject] = React.useState<Project | undefined>();
  const [selectedProject, setSelectedProject] = React.useState<Project | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleCreateProject = async (data: ProjectFormData) => {
    setIsLoading(true);
    // Set initial progress to 0 as it will be calculated from tasks
    const initialProgress = 0;
    
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        name: data.name,
        description: data.description,
        progress: initialProgress,
        status: data.status,
        contact_id: data.contactId
      })
      .select(`
        *,
        contact:contacts(*)
      `)
      .single();

    if (error) {
      console.error('Error creating project:', error);
      setIsLoading(false);
      return;
    }

    const project: Project = {
      id: newProject.id,
      name: newProject.name,
      description: newProject.description,
      progress: newProject.progress,
      status: newProject.status,
      contactId: newProject.contact_id,
      contact: newProject.contact,
      createdAt: newProject.created_at,
      updatedAt: newProject.updated_at
    };

    setProjects((prev) => [...prev, project]);
    showSuccessMessage('Projet créé avec succès');
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleUpdateProject = async (data: ProjectFormData) => {
    if (!editingProject) return;
    setIsLoading(true);
    
    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update([{
        name: data.name,
        description: data.description,
        status: data.status,
        contact_id: data.contactId
      }])
      .eq('id', editingProject.id)
      .select(`
        *,
        contact:contacts(*)
      `)
      .single();

    if (error) {
      console.error('Error updating project:', error);
      setIsLoading(false);
      return;
    }

    const project: Project = {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      progress: updatedProject.progress,
      status: updatedProject.status,
      contactId: updatedProject.contact_id,
      contact: updatedProject.contact,
      createdAt: updatedProject.created_at,
      updatedAt: updatedProject.updated_at
    };

    setProjects((prev) =>
      prev.map((p) =>
        p.id === editingProject.id ? project : p
      )
    );
    showSuccessMessage('Projet mis à jour avec succès');
    setEditingProject(undefined);
    setIsLoading(false);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;

    // Vérifier si le projet a des devis associés
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('id')
      .eq('project_id', id);

    // Vérifier si le projet a des factures associées
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('id')
      .eq('project_id', id);

    if (quotesError || invoicesError) {
      console.error('Error checking project relations:', { quotesError, invoicesError });
      setError('Une erreur est survenue lors de la vérification des relations du projet');
      return;
    }

    if (quotesData?.length || invoicesData?.length) {
      setError(
        'Impossible de supprimer ce projet car il est associé à ' +
        [
          quotesData?.length ? `${quotesData.length} devis` : null,
          invoicesData?.length ? `${invoicesData.length} facture(s)` : null
        ]
          .filter(Boolean)
          .join(' et ') +
        '. Veuillez d\'abord supprimer ces éléments.'
      );
      return;
    }

      setIsLoading(true);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        setIsLoading(false);
        setError('Erreur lors de la suppression du projet : ' + error.message);
        return;
      }

      setProjects((prev) => prev.filter((project) => project.id !== id));
      showSuccessMessage('Projet supprimé avec succès');
      setIsLoading(false);
      setConfirmDelete(null);
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    console.log('Updating task status:', taskId, status);
    setTasks(prev => prev.map(task =>
      task.id === taskId
        ? { ...task, status, updatedAt: new Date().toISOString() }
        : task
    ));
    
    // Update task in database
    supabase
      .from('tasks')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId)
      .then(({ error }) => {
        if (error) {
          console.error('Error updating task status:', error);
        }
      });
  };

  if (selectedProject) {
    return (
      <ProjectKanbanPage
        project={selectedProject}
        tasks={tasks}
        onUpdateTask={handleUpdateTaskStatus}
        onBack={() => setSelectedProject(undefined)}
      />
    );
  }

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

      {successMessage && (
        <div className="mb-4">
          <Notification
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <FolderKanban className="h-8 w-8 text-indigo-600 mr-3" />
            <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            New Project
          </button>
        </div>

        {(isFormOpen || editingProject) && (
          <div className="mb-6">
            <ProjectForm
              isLoading={isLoading}
              contacts={contacts}
              initialData={editingProject}
              onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingProject(undefined);
              }}
            />
          </div>
        )}

        <ProjectList
          projects={projects}
          contacts={contacts}
          onViewKanban={setSelectedProject}
          onEdit={setEditingProject}
          onDelete={handleDeleteClick}
        />

        <ConfirmDialog
          isOpen={confirmDelete !== null}
          title="Supprimer le projet"
          message="Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible."
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirmDelete(null)}
          confirmLabel="Supprimer"
          cancelLabel="Annuler"
          type="danger"
        />
    </div>
  );
}