import React from 'react';
import { Project, ProjectFormData, ProjectStatus } from '../../types/project';
import { Contact } from '../../types/contact';

interface ProjectFormProps {
  isLoading?: boolean;
  contacts: Contact[];
  initialData?: Project;
  onSubmit: (data: ProjectFormData) => void;
  onCancel: () => void;
}

export function ProjectForm({ isLoading = false, contacts, initialData, onSubmit, onCancel }: ProjectFormProps) {
  const [formData, setFormData] = React.useState<ProjectFormData>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    progress: initialData?.progress || 0,
    status: initialData?.status || 'not_started',
    contactId: initialData?.contactId || '',
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
      [name]: name === 'progress' ? Number(value) : value,
    }));
  };

  const statuses: ProjectStatus[] = [
    'not_started',
    'in_progress',
    'completed',
    'on_hold',
    'cancelled',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          required
          value={formData.name}
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
          required
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
          Contact
        </label>
        <select
          name="contactId"
          id="contactId"
          required
          value={formData.contactId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Select a contact</option>
          {contacts.map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
          Progress ({formData.progress}%)
        </label>
        <input
          type="range"
          name="progress"
          id="progress"
          min="0"
          max="100"
          value={formData.progress}
          onChange={handleChange}
          className="mt-1 block w-full"
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
          disabled={isLoading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {initialData ? 'Updating...' : 'Creating...'}
            </div>
          ) : (
            initialData ? 'Update Project' : 'Create Project'
          )}
        </button>
      </div>
    </form>
  );
}