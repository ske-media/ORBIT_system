import React from 'react';
import { Contact, ContactFormData } from '../../types/contact';
import { Company, CompanyFormData } from '../../types/company';
import { ContactList } from '../../components/contacts/ContactList';
import { ContactForm } from '../../components/contacts/ContactForm';
import { CompanyForm } from '../../components/companies/CompanyForm';
import { Plus, Users } from 'lucide-react';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Notification } from '../../components/ui/Notification';
import { supabase, retryableQuery } from '../../lib/supabase';

interface ContactsPageProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
}

export function ContactsPage({ contacts, setContacts, companies, setCompanies }: ContactsPageProps) {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<Contact | undefined>();
  const [editingCompany, setEditingCompany] = React.useState<Company | undefined>();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null);

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

    if (data) {
      const companiesData: Company[] = data.map((company) => ({
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
        country: company.country,
        createdAt: company.created_at,
        updatedAt: company.updated_at
      }));
      setCompanies(companiesData);
    }
  };

  const handleCreateCompany = async (data: CompanyFormData): Promise<Company> => {
    setIsLoading(true);
    
    if (!data.name) {
      throw new Error('Le nom de l\'entreprise est requis');
    }

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
        notes: data.notes,
        country: data.country
      }])
      .select()
      .single();

    if (error) {
      setIsLoading(false);
      throw error;
    }

    if (!newCompany) {
      setIsLoading(false);
      throw new Error('Erreur lors de la création de l\'entreprise');
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
      country: newCompany.country,
      createdAt: newCompany.created_at,
      updatedAt: newCompany.updated_at
    };

    setCompanies((prev) => [...prev, company]);
    setIsLoading(false);
    return company;
  };

  const handleUpdateCompany = async (data: CompanyFormData) => {
    if (!editingCompany) return;
    
    setIsLoading(true);
    setError(null);

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
        notes: data.notes,
        country: data.country
      })
      .eq('id', editingCompany.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating company:', error);
      setIsLoading(false);
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
      country: updatedCompany.country,
      createdAt: updatedCompany.created_at,
      updatedAt: updatedCompany.updated_at
    };

    setCompanies((prev) =>
      prev.map((c) => (c.id === editingCompany.id ? company : c))
    );
    setSuccess('Entreprise mise à jour avec succès');
    setEditingCompany(undefined);
    setIsLoading(false);
  };

  const handleCreateContact = async (data: ContactFormData) => {
    setIsLoading(true);
    setError(null);
    
    const contactData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone === '' ? null : data.phone,
      company_id: data.companyId === '' ? null : data.companyId,
      temperature: data.temperature
    };

    const { data: newContact, error } = await retryableQuery(() =>
      supabase
        .from('contacts')
        .insert(contactData)
        .select(`
          *,
          company:companies(*)
        `)
        .single()
    );

    if (error) {
      console.error('Error creating contact:', error);
      let errorMessage = 'Une erreur est survenue lors de la création du contact';
      
      // Messages d'erreur personnalisés selon le code d'erreur
      switch (error.code) {
        case '23505': // Violation de contrainte unique
          errorMessage = 'Un contact avec cet email existe déjà';
          break;
        case '23503': // Violation de clé étrangère
          errorMessage = 'L\'entreprise sélectionnée n\'existe pas ou a été supprimée';
          break;
        case '23502': // Violation de contrainte NOT NULL
          errorMessage = 'Veuillez remplir tous les champs obligatoires';
          break;
        case '42703': // Colonne indéfinie
          errorMessage = 'Une erreur de structure est survenue. Veuillez contacter le support';
          break;
        default:
          errorMessage = `Erreur : ${error.message}`;
      }
      
      setError(errorMessage);
      setIsLoading(false);
      return;
    }

    const contact: Contact = {
      id: newContact.id,
      firstName: newContact.first_name,
      lastName: newContact.last_name,
      email: newContact.email,
      phone: newContact.phone,
      companyId: newContact.company_id,
      company: newContact.company,
      temperature: newContact.temperature,
      createdAt: newContact.created_at,
      updatedAt: newContact.updated_at
    };

    setContacts((prev) => [...prev, contact]);
    setSuccess('Contact créé avec succès');
    setIsFormOpen(false);
    setIsLoading(false);
  };

  const handleUpdateContact = async (data: ContactFormData) => {
    if (!editingContact) return;
    
    const { data: updatedContact, error } = await retryableQuery(() =>
      supabase
        .from('contacts')
        .update([{
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          temperature: data.temperature,
          company_id: data.companyId === '' ? null : data.companyId
        }])
        .eq('id', editingContact.id)
        .select(`
          *,
          company:companies(*)
        `)
        .single()
    );

    if (error) {
      console.error('Error updating contact:', error);
      setError('Erreur lors de la mise à jour du contact');
      return;
    }

    const contact: Contact = {
      id: updatedContact.id,
      firstName: updatedContact.first_name,
      lastName: updatedContact.last_name,
      email: updatedContact.email,
      phone: updatedContact.phone,
      companyId: updatedContact.company_id,
      company: updatedContact.company,
      temperature: updatedContact.temperature,
      createdAt: updatedContact.created_at,
      updatedAt: updatedContact.updated_at
    };

    setContacts((prev) =>
      prev.map((c) => (c.id === editingContact.id ? contact : c))
    );
    setEditingContact(undefined);
  };

  const handleDeleteClick = (id: string) => {
    setConfirmDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const id = confirmDelete;

    // Check if contact has associated projects
    const { data: projectsData, error: projectsError } = await retryableQuery(() =>
      supabase
        .from('projects')
        .select('id')
        .eq('contact_id', id)
    );

    // Check if contact has associated invoices
    const { data: invoicesData, error: invoicesError } = await retryableQuery(() =>
      supabase
        .from('invoices')
        .select('id')
        .eq('contact_id', id)
    );

    // Check if contact has associated quotes
    const { data: quotesData, error: quotesError } = await retryableQuery(() =>
      supabase
        .from('quotes')
        .select('id')
        .eq('contact_id', id)
    );

    if (projectsError || invoicesError || quotesError) {
      console.error('Error checking contact relations:', { projectsError, invoicesError, quotesError });
      setError('Une erreur est survenue lors de la vérification des relations du contact');
      return;
    }

    if (projectsData?.length || invoicesData?.length || quotesData?.length) {
      setError(
        'Impossible de supprimer ce contact car il est associé à ' +
        [
          projectsData?.length ? `${projectsData.length} projet(s)` : null,
          invoicesData?.length ? `${invoicesData.length} facture(s)` : null,
          quotesData?.length ? `${quotesData.length} devis` : null
        ]
          .filter(Boolean)
          .join(', ') +
        '. Veuillez d\'abord supprimer ou réassigner ces éléments.'
      );
      return;
    }

    const { error } = await retryableQuery(() => supabase
      .from('contacts')
      .delete()
      .eq('id', id));

    if (error) {
      setError('Erreur lors de la suppression du contact : ' + error.message);
      return;
    }

    setContacts((prev) => prev.filter((contact) => contact.id !== id));
    setSuccess('Contact supprimé avec succès');
    setTimeout(() => setSuccess(null), 3000);
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
          <Users className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">Contacts</h1>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau contact
        </button>
      </div>

      {(isFormOpen || editingContact) && (
        <div className="mb-6">
          <ContactForm
            companies={companies}
            onCreateCompany={handleCreateCompany}
            initialData={editingContact}
            onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingContact(undefined);
            }}
          />
        </div>
      )}

      {editingCompany && (
        <div className="mb-6">
          <CompanyForm
            initialData={editingCompany}
            onSubmit={handleUpdateCompany}
            onCancel={() => setEditingCompany(undefined)}
          />
        </div>
      )}

      <ContactList
        contacts={contacts}
        companies={companies}
        onEdit={setEditingContact}
        onDelete={handleDeleteClick}
        onEditCompany={setEditingCompany}
      />

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Supprimer le contact"
        message="Êtes-vous sûr de vouloir supprimer ce contact ? Cette action est irréversible."
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        type="danger"
      />
    </div>
  );
}