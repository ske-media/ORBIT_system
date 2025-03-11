import React from 'react';
import { Contact } from '../../types/contact';
import { Company } from '../../types/company';
import { Project } from '../../types/project';
import { Quote, QuoteFormData, DocumentLineFormData } from '../../types/finance';
import { DocumentLineForm } from './DocumentLineForm';
import { FileText, ArrowLeft, Building2, User, FolderKanban } from 'lucide-react';

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
    lines: initialData?.lines?.map(line => ({
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice
    })) || [],
  });
  
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'projectId' ? (value ? value : null) : value,
    }));
  };

  const handleLinesChange = (lines: DocumentLineFormData[]) => {
    const totalAmount = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    setFormData(prev => ({
      ...prev,
      lines,
      totalAmount
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    // Validate required fields
    if (!formData.companyId) {
      setError('Veuillez sélectionner une entreprise');
      setIsSubmitting(false);
      return;
    }
    
    // Validate that we have at least one line
    if (formData.lines.length === 0) {
      setError('Veuillez ajouter au moins une ligne au devis');
      setIsSubmitting(false);
      return;
    }
    
    try {
      onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">
            {initialData ? 'Modifier le devis' : 'Nouveau devis'}
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Informations générales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Client
              </label>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
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
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <label htmlFor="contactId" className="block text-sm font-medium text-gray-700">
                      Contact
                    </label>
                    <select
                      name="contactId"
                      id="contactId"
                      value={formData.contactId || ''}
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
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Détails
              </label>
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FolderKanban className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <label htmlFor="projectId" className="block text-sm font-medium text-gray-700">
                      Projet
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
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
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
                </div>

                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1">
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Statut
                    </label>
                    <select
                      name="status"
                      id="status"
                      required
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="sent">Envoyé</option>
                      <option value="accepted">Accepté</option>
                      <option value="rejected">Refusé</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <DocumentLineForm
            lines={formData.lines}
            onChange={handleLinesChange}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {initialData ? 'Mise à jour...' : 'Création...'}
              </div>
            ) : (
              initialData ? 'Mettre à jour le devis' : 'Créer le devis'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}