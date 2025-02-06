import React from 'react';
import { Contact } from '../../types/contact';
import { Company } from '../../types/company';
import { Project } from '../../types/project';
import { Invoice, InvoiceFormData, Payment, PaymentFormData } from '../../types/finance';

import { DocumentLineForm } from './DocumentLineForm';

interface InvoiceFormProps {
  contacts: Contact[];
  companies: Company[];
  projects: Project[];
  initialData?: Invoice;
  payments?: Payment[];
  onSubmit: (data: InvoiceFormData) => void;
  onAddPayment?: (data: PaymentFormData) => void;
  onDeletePayment?: (id: string) => void;
  onCancel: () => void;
}

export function InvoiceForm({
  contacts,
  companies,
  projects,
  initialData,
  payments = [],
  onSubmit,
  onAddPayment,
  onDeletePayment,
  onCancel
}: InvoiceFormProps) {
  const [formData, setFormData] = React.useState<InvoiceFormData>({
    companyId: initialData?.companyId || '',
    contactId: initialData?.contactId || '',
    projectId: initialData?.projectId || null,
    invoiceDate: initialData?.invoiceDate.split('T')[0] || new Date().toISOString().split('T')[0],
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

  const handleLinesChange = (lines: DocumentLineFormData[]) => {
    const totalAmount = lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0);
    setFormData(prev => ({
      ...prev,
      lines,
      totalAmount
    }));
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit(formData);
    }} className="space-y-8">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Informations générales</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Client
            </label>
            <div className="space-y-4">
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
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Détails
            </label>
            <div className="space-y-4">
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
                <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700">
                  Date de facturation
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  id="invoiceDate"
                  required
                  value={formData.invoiceDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
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

      <div>
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
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {initialData ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div></form>
  );
}