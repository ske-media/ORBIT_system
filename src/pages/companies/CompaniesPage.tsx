import React from 'react';
import { Company, CompanyFormData } from '../../types/company';
import { Contact } from '../../types/contact';
import { CompanyList } from '../../components/companies/CompanyList';
import { CompanyForm } from '../../components/companies/CompanyForm';
import { Plus, Building2 } from 'lucide-react';
import { supabase, retryableQuery } from '../../lib/supabase';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Notification } from '../../components/ui/Notification';

interface CompaniesPageProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

export function CompaniesPage({ contacts, setContacts }: CompaniesPageProps) {
  const [companies, setCompanies] = React.useState<Company[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingCompany, setEditingCompany] = React.useState<Company | undefined>();
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const { data, error } = await retryableQuery(() =>
      supabase
        .from('companies')
        .select('*')
        .order('name')
    );
    
    if (error) {
      console.error('Error loading companies:', error);
      setError('Erreur lors du chargement des entreprises. Veuillez rafraîchir la page.');
      return;
    }

    setCompanies(data.map(company => ({
      id: company.id,
      name: company.name,
      address: company.address,
      postal_code: company.postal_code,
      city: company.city,
      phone: company.phone,
      email: company.email,
      website: company.website,
      siret: company.siret,
      vat: company.vat,
      notes: company.notes,
      createdAt: company.created_at,
      updatedAt: company.updated_at
    })));
  };

  const handleCreateCompany = async (data: CompanyFormData) => {
    const { data: newCompany, error } = await supabase
      .from('companies')
      .insert([{
        name: data.name,
        address: data.address,
        postal_code: data.postal_code,
        city: data.city,
        phone: data.phone,
        email: data.email,
        website: data.website,
        siret: data.siret,
        vat: data.vat,
        notes: data.notes
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating company:', error);
      return;
    }

    const company: Company = {
      id: newCompany.id,
      name: newCompany.name,
      address: newCompany.address,
      postal_code: newCompany.postal_code,
      city: newCompany.city,
      phone: newCompany.phone,
      email: newCompany.email,
      website: newCompany.website,
      siret: newCompany.siret,
      vat: newCompany.vat,
      notes: newCompany.notes,
      createdAt: newCompany.created_at,
      updatedAt: newCompany.updated_at
    };

    setCompanies((prev) => [...prev, company]);
    setIsFormOpen(false);
  };

  const handleUpdateCompany = async (data: CompanyFormData) => {
    if (!editingCompany) return;
    
    const { data: updatedCompany, error } = await supabase
      .from('companies')
      .update({
        name: data.name,
        address: data.address,
        postal_code: data.postal_code,
        city: data.city,
        phone: data.phone,
        email: data.email,
        website: data.website,
        siret: data.siret,
        vat: data.vat,
        notes: data.notes
      })
      .eq('id', editingCompany.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      return;
    }

    const company: Company = {
      id: updatedCompany.id,
      name: updatedCompany.name,
      address: updatedCompany.address,
      postal_code: updatedCompany.postal_code,
      city: updatedCompany.city,
      phone: updatedCompany.phone,
      email: updatedCompany.email,
      website: updatedCompany.website,
      siret: updatedCompany.siret,
      vat: updatedCompany.vat,
      notes: updatedCompany.notes,
      createdAt: updatedCompany.created_at,
      updatedAt: updatedCompany.updated_at
    };

    setCompanies((prev) =>
      prev.map((c) => (c.id === editingCompany.id ? company : c))
    );
    setEditingCompany(undefined);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;
    setError(null);

    // Vérifier si l'entreprise a des contacts associés
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select(`
        id,
        projects!projects_contact_id_fkey (id)
      `)
      .eq('company_id', id);

    // Vérifier si l'entreprise a des factures associées
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('id')
      .eq('company_id', id);

    // Vérifier si l'entreprise a des devis associés
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('id')
      .eq('company_id', id);

    if (contactsError || invoicesError || quotesError) {
      console.error('Error checking company relations:', { contactsError, invoicesError, quotesError });
      setError('Une erreur est survenue lors de la vérification des relations de l\'entreprise');
      return;
    }

    // Vérifier si des contacts de l'entreprise ont des projets
    const hasProjects = contactsData?.some(contact => contact.projects?.length > 0);

    if (contactsData?.length || invoicesData?.length || quotesData?.length || hasProjects) {
      setError(
        'Impossible de supprimer cette entreprise car elle est associée à ' +
        [
          contactsData?.length ? `${contactsData.length} contact(s)` : null,
          hasProjects ? 'des projets' : null,
          invoicesData?.length ? `${invoicesData.length} facture(s)` : null,
          quotesData?.length ? `${quotesData.length} devis` : null
        ]
          .filter(Boolean)
          .join(', ') +
        '. Veuillez d\'abord supprimer ou réassigner ces éléments.'
      );
      return;
    }

      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

      if (error) {
        setError('Erreur lors de la suppression de l\'entreprise : ' + error.message);
        return;
      }

      setCompanies((prev) => prev.filter((company) => company.id !== id));
      setSuccess('Entreprise supprimée avec succès');
      setConfirmDelete(null);
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
          <Building2 className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">Entreprises</h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvelle entreprise
        </button>
      </div>

      {(isFormOpen || editingCompany) && (
        <div className="mb-6">
          <CompanyForm
            initialData={editingCompany}
            onSubmit={editingCompany ? handleUpdateCompany : handleCreateCompany}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingCompany(undefined);
            }}
          />
        </div>
      )}

      <CompanyList
        companies={companies}
        contacts={contacts}
        onEdit={setEditingCompany}
        onDelete={handleDeleteClick}
      />

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer l'entreprise"
        message="Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        type="danger"
      />
    </div>
  );
}