import React from 'react';
import { Project } from '../../types/project';
import { Contact } from '../../types/contact';
import { Edit, Trash2, FolderKanban, User } from 'lucide-react';

interface ProjectListProps {
  projects: Project[];
  contacts: Contact[];
  onViewKanban: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export function ProjectList({ projects, contacts, onViewKanban, onEdit, onDelete }: ProjectListProps) {
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Unknown Contact';
  };

  const getStatusColor = (status: Project['status']) => {
    const colors = {
      not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      on_hold: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {projects.map((project) => (
            <tr 
              key={project.id} 
              className="hover:bg-gray-50 cursor-pointer transition-colors duration-150 group"
            >
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center">
                  <FolderKanban className="h-10 w-10 text-indigo-500" />
                  <div className="ml-4 flex-1">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                    <div className="text-sm text-gray-500">{project.description}</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewKanban(project);
                    }}
                    className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md px-2 py-1"
                  >
                    <span className="text-xs text-indigo-600">
                      Voir le tableau Kanban →
                    </span>
                  </button>
                </div>
              </td>
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{getContactName(project.contactId)}</span>
                </div>
              </td>
              <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500 mt-1">{project.progress}%</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(project)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Modifier"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Supprimer"
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