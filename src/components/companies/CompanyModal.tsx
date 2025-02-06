import React from 'react';
import { CompanyFormData } from '../../types/company';
import { Building2 } from 'lucide-react';

interface CompanyModalProps {
  onSubmit: (data: CompanyFormData) => Promise<void>;
  onClose: () => void;
}

export function CompanyModal({ onSubmit, onClose }: CompanyModalProps) {
  const [formData, setFormData] = React.useState<CompanyFormData>({
    name: '',
    address: '',
    postal_code: '',
    city: '',
    phone: '',
    email: '',
    website: '',
    siret: '',
    vat: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setError(null);
    try {
      await onSubmit(formData);
      setSuccess('Entreprise créée avec succès');
      setTimeout(() => {
        onClose();
      }, 1500);
      setSuccess('Entreprise créée avec succès');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Building2 className="h-6 w-6 text-indigo-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                Nouvelle entreprise
              </h3>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-name" className="block text-sm font-medium text-gray-700">
                  Nom de l'entreprise *
                </label>
                <input
                  type="text"
                  id="company-name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="company-email" className="block text-sm font-medium text-gray-700">
                  Courriel
                </label>
                <input
                  type="email"
                  id="company-email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-phone" className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <input
                  type="tel"
                  id="company-phone"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
                  Site web
                </label>
                <input
                  type="url"
                  id="company-website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company-siret" className="block text-sm font-medium text-gray-700">
                  Numéro SIRET
                </label>
                <input
                  type="text"
                  id="company-siret"
                  value={formData.siret || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, siret: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="company-vat" className="block text-sm font-medium text-gray-700">
                  Numéro de TVA
                </label>
                <input
                  type="text"
                  id="company-vat"
                  value={formData.vat || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, vat: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="company-address" className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <input
                  type="text"
                  id="company-address"
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="company-postal-code" className="block text-sm font-medium text-gray-700">
                  Code postal
                </label>
                <input
                  type="text"
                  id="company-postal-code"
                  value={formData.postal_code || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="company-city" className="block text-sm font-medium text-gray-700">
                  Ville
                </label>
                <input
                  type="text"
                  id="company-city"
                  value={formData.city || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-3">
                <label htmlFor="company-country" className="block text-sm font-medium text-gray-700">
                  Pays
                </label>
                <select
                  id="company-country"
                  value={formData.country || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Sélectionner un pays</option>
                  <option value="France">France</option>
                  <option value="Suisse">Suisse</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="company-notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="company-notes"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                aria-disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Création...
                  </div>
                ) : (
                  'Créer'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}