import React from 'react';
import { Contact, ContactFormData, Temperature } from '../../types/contact';
import { Company, CompanyFormData } from '../../types/company';
import { Building2, Plus } from 'lucide-react';
import { CompanyModal } from '../companies/CompanyModal';

interface ContactFormProps {
  initialData?: Contact;
  companies: Company[];
  onCreateCompany: (data: CompanyFormData) => Promise<Company>;
  onSubmit: (data: ContactFormData) => void;
  onCancel: () => void;
}

export function ContactForm({ initialData, companies, onCreateCompany, onSubmit, onCancel }: ContactFormProps) {
  const [formData, setFormData] = React.useState<ContactFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || null,
    companyId: initialData?.companyId || '',
    temperature: initialData?.temperature || 'cold',
  });
  const [isCompanyFormOpen, setIsCompanyFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Valider les champs requis
    if (!formData.firstName.trim()) {
      setError('Le prénom est requis');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setError('Le nom est requis');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('L\'email est requis');
      return;
    }

    // Valider le format de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      setError('Veuillez remplir tous les champs obligatoires');
      setIsSubmitting(false);
      return;
    }
    
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Error submitting contact:', err);
      if (err instanceof Error) {
        if (err.message.includes('duplicate key')) {
          setError('Un contact avec cet email existe déjà');
        } else {
          setError(err.message);
        }
      } else {
        setError('Une erreur est survenue');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (name === 'companyId') {
        return { ...prev, companyId: value || null };
      }
      if (name === 'phone') {
        return { ...prev, phone: value || null };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleCreateCompany = async (data: CompanyFormData) => {
    try {
      const company = await onCreateCompany(data);
      // Update form data with new company ID
      const updatedFormData = {
        ...formData,
        companyId: company.id
      };
      setFormData(updatedFormData);
      setIsCompanyFormOpen(false);
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Prénom
          </label>
          <input
            type="text"
            name="firstName"
            id="firstName"
            required
            value={formData.firstName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nom
          </label>
          <input
            type="text"
            name="lastName"
            id="lastName"
            required
            value={formData.lastName}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Courriel
        </label>
        <input
          type="email"
          name="email"
          id="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Téléphone
        </label>
        <input
          type="tel"
          name="phone"
          id="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="companyId" className="block text-sm font-medium text-gray-700">
          Entreprise
        </label>
        <div className="mt-1 flex items-center gap-2">
          <select 
            name="companyId"
            id="companyId"
            value={formData.companyId || ''}
            onChange={handleChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Aucune entreprise</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsCompanyFormOpen(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nouvelle
          </button>
        </div>
      </div>

      {isCompanyFormOpen && (
        <CompanyModal
          onSubmit={handleCreateCompany}
          onClose={() => setIsCompanyFormOpen(false)}
        />
      )}
      <div>
        <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
          Température
        </label>
        <select
          name="temperature"
          id="temperature"
          required
          value={formData.temperature}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          <option value="cold">Froid</option>
          <option value="warm">Tiède</option>
          <option value="hot">Chaud</option>
          <option value="client">Client</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => onCancel()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !formData.firstName || !formData.lastName || !formData.email}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {initialData ? 'Mise à jour...' : 'Création...'}
            </div>
          ) : (
            initialData ? 'Mettre à jour' : 'Créer'
          )}
        </button>
      </div>
    </form>
  );
}