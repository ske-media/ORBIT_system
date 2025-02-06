import React from 'react';
import { Contact } from '../../types/contact';
import { Company } from '../../types/company';
import { Project } from '../../types/project';
import { Quote, QuoteFormData } from '../../types/finance';

interface QuoteFormProps {
  contacts: Contact[];
  companies: Company[];
  projects: Project[];
  initialData?: Quote;
  onSubmit: (data: QuoteFormData) => void;
  onCancel: () => void;
}

export function QuoteForm({ contacts, companies, projects, initialData, onSubmit, onCancel }: QuoteFormProps) {
  const [formData, setFormData] = React.useState<QuoteFormData>({
    companyId: initialData?.companyId || '',
    contactId: initialData?.contactId || '',
    projectId: initialData?.projectId || null,
    quoteDate: initialData?.quoteDate.split('T')[0] || new Date().toISOString().split('T')[0],
    status: initialData?.status || 'draft',
    totalAmount: initialData?.totalAmount || 0,
    lines: initialData?.lines || [],
  });

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'projectId' ? (value ? value : null) : value,
    }));
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }}>
      <div>
        <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
          Entreprise *
        </label>
        <select
          name="companyId"
          id="companyId"
          required
          value={formData.companyId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Sélectionner une entreprise</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
          Contact (optionnel)
        </label>
        <select
          name="contactId"
          id="contactId"
          value={formData.contactId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Sélectionner un contact</option>
          {contacts
            .filter(contact => contact.companyId === formData.companyId)
            .map((contact) => (
            <option key={contact.id} value={contact.id}>
              {contact.firstName} {contact.lastName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
          Projet (optionnel)
        </label>
        <select
          name="projectId"
          id="projectId"
          value={formData.projectId || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="">Sélectionner un projet</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="quoteDate" className="block text-sm font-medium text-gray-700">
          Date du devis
        </label>
        <input
          type="date"
          name="quoteDate"
          id="quoteDate"
          required
          value={formData.quoteDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}