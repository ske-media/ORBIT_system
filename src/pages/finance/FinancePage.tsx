import React from 'react';
import { Contact } from '../../types/contact';
import { Project } from '../../types/project';
import { Company } from '../../types/company';
import { Invoice, Quote, Payment, InvoiceFormData, QuoteFormData, PaymentFormData } from '../../types/finance';
import { InvoiceList } from '../../components/finance/InvoiceList';
import { QuoteList } from '../../components/finance/QuoteList';
import { InvoiceForm } from '../../components/finance/InvoiceForm';
import { QuoteForm } from '../../components/finance/QuoteForm';
import { PaymentForm } from '../../components/finance/PaymentForm';
import { CreateQuotePage } from './CreateQuotePage';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Notification } from '../../components/ui/Notification';
import { Receipt, FileText, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FinancePageProps {
  contacts: Contact[];
  projects: Project[];
  companies: Company[];
  invoices: Invoice[];
  quotes: Quote[];
  payments: Payment[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
}

export function FinancePage({ 
  contacts, 
  projects, 
  companies,
  invoices,
  quotes,
  payments,
  setInvoices,
  setQuotes,
  setPayments
}: FinancePageProps) {
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | undefined>();
  const [activeTab, setActiveTab] = React.useState<'invoices' | 'quotes'>('invoices');
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = React.useState(false);
  const [isQuoteFormOpen, setIsQuoteFormOpen] = React.useState(false);
  const [editingInvoice, setEditingInvoice] = React.useState<Invoice | undefined>();
  const [editingQuote, setEditingQuote] = React.useState<Quote | undefined>();
  const [isCreatingQuote, setIsCreatingQuote] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<{ type: 'invoice' | 'quote' | 'payment', id: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    // Load invoices
    const { data: invoicesData, error: invoicesError } = await supabase
      .from('invoices')
      .select('*, invoice_lines(*)');
    
    if (invoicesError) {
      console.error('Error loading invoices:', invoicesError);
    } else {
      setInvoices(invoicesData.map(invoice => ({
        id: invoice.id,
        companyId: invoice.company_id,
        contactId: invoice.contact_id,
        projectId: invoice.project_id,
        invoiceDate: invoice.invoice_date,
        status: invoice.status,
        totalAmount: invoice.total_amount,
        lines: invoice.invoice_lines,
        createdAt: invoice.created_at,
        updatedAt: invoice.updated_at
      })));
    }

    // Load quotes
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*, quote_lines(*)');
    
    if (quotesError) {
      console.error('Error loading quotes:', quotesError);
    } else {
      setQuotes(quotesData.map(quote => ({
        id: quote.id,
        companyId: quote.company_id,
        contactId: quote.contact_id,
        projectId: quote.project_id,
        number: quote.number,
        quoteNumber: quote.quote_number,
        quoteDate: quote.quote_date,
        status: quote.status,
        totalAmount: quote.total_amount,
        lines: quote.quote_lines,
        createdAt: quote.created_at,
        updatedAt: quote.updated_at
      })));
    }

    // Load payments
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('invoice_payments')
      .select('*');
    
    if (paymentsError) {
      console.error('Error loading payments:', paymentsError);
    } else {
      setPayments(paymentsData.map(payment => ({
        id: payment.id,
        invoiceId: payment.invoice_id,
        paymentDate: payment.payment_date,
        amountPaid: payment.amount_paid,
        paymentMethod: payment.payment_method,
        notes: payment.notes,
        createdAt: payment.created_at,
        updatedAt: payment.updated_at
      })));
    }
  };

  const loadCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error loading companies:', error);
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

  const handleCreateInvoice = async (data: InvoiceFormData) => {
    // Validate line items
    if (!data.lines.length) {
      console.error('No invoice lines provided');
      return;
    }

    // Ensure all required fields are present and valid
    const validatedLines = data.lines.map(line => ({
      description: line.description || '',
      quantity: Math.max(0.01, line.quantity || 0),
      unit_price: Math.max(0, line.unitPrice || 0)
    }));

    // Create invoice first
    const { data: newInvoice, error } = await supabase
      .from('invoices')
      .insert([{
        company_id: data.companyId,
        contact_id: data.contactId,
        project_id: data.projectId,
        invoice_date: data.invoiceDate,
        status: data.status,
        total_amount: data.totalAmount
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating invoice:', error);
      return;
    }

    // Create invoice lines
    const { error: linesError } = await supabase
      .from('invoice_lines')
      .insert(validatedLines.map(line => ({
        invoice_id: newInvoice.id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price
      })));

    if (linesError) {
      console.error('Error creating invoice lines:', linesError);
      return;
    }

    loadFinanceData();
    setIsInvoiceFormOpen(false);
  };

  const handleCreateQuote = async (data: QuoteFormData) => {
    setError(null);
    
    const { data: newQuote, error } = await supabase
      .from('quotes')
      .insert([{
        company_id: data.companyId,
        contact_id: data.contactId,
        project_id: data.projectId,
        quote_date: data.quoteDate,
        status: data.status,
        total_amount: data.totalAmount
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating quote:', error);
      setError('Erreur lors de la création du devis');
      return;
    }

    // Create quote lines
    const { error: linesError } = await supabase
      .from('quote_lines')
      .insert(data.lines.map(line => ({
        quote_id: newQuote.id,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unitPrice
      })));

    if (linesError) {
      console.error('Error creating quote lines:', linesError);
      return;
    }

    loadFinanceData();
    setSuccess('Devis créé avec succès');
    setIsQuoteFormOpen(false);
    setIsCreatingQuote(false);
  };

  const handleUpdateQuote = async (data: QuoteFormData) => {
    if (!editingQuote) return;
    setError(null);
    
    try {
      // Update the quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          company_id: data.companyId,
          contact_id: data.contactId,
          project_id: data.projectId,
          quote_date: data.quoteDate,
          status: data.status,
          total_amount: data.totalAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingQuote.id);
  
      if (quoteError) {
        throw new Error(`Erreur lors de la mise à jour du devis: ${quoteError.message}`);
      }

      // Delete existing quote lines
      const { error: deleteError } = await supabase
        .from('quote_lines')
        .delete()
        .eq('quote_id', editingQuote.id);
      
      if (deleteError) {
        throw new Error(`Erreur lors de la suppression des lignes de devis: ${deleteError.message}`);
      }

      // Insert new quote lines
      const { error: linesError } = await supabase
        .from('quote_lines')
        .insert(data.lines.map(line => ({
          quote_id: editingQuote.id,
          description: line.description,
          quantity: line.quantity,
          unit_price: line.unitPrice
        })));
      
      if (linesError) {
        throw new Error(`Erreur lors de la création des lignes de devis: ${linesError.message}`);
      }

      loadFinanceData();
      setSuccess('Devis mis à jour avec succès');
      setEditingQuote(undefined);
    } catch (err) {
      console.error('Error updating quote:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour du devis');
    }
  };

  const handleAddPayment = async (data: PaymentFormData) => {
    if (!selectedInvoice) return;

    // Validate payment amount
    if (!data.amountPaid || data.amountPaid <= 0) {
      setError('Le montant du paiement doit être supérieur à 0');
      return;
    }

    const remainingAmount = selectedInvoice.totalAmount -
      payments
        .filter(p => p.invoiceId === selectedInvoice.id)
        .reduce((sum, p) => sum + p.amountPaid, 0);

    if (data.amountPaid > remainingAmount) {
      setError('Le montant du paiement ne peut pas dépasser le montant restant dû');
      return;
    }

    const { error } = await supabase
      .from('invoice_payments')
      .insert([{
        invoice_id: selectedInvoice.id,
        payment_date: data.paymentDate,
        amount_paid: data.amountPaid,
        payment_method: data.paymentMethod,
        notes: data.notes
      }]);

    if (error) {
      console.error('Error adding payment:', error);
      setError('Erreur lors de l\'enregistrement du paiement');
      return;
    }

    loadFinanceData();
    setSuccess('Paiement enregistré avec succès');
    setSelectedInvoice(undefined);
  };

  const handleDeleteClick = (type: 'invoice' | 'quote' | 'payment', id: string) => {
    setConfirmDelete({ type, id });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;

    try {
      if (type === 'invoice') {
        // Vérifier si la facture a des paiements
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('invoice_payments')
          .select('id')
          .eq('invoice_id', id);

        if (paymentsError) {
          throw paymentsError;
        }

        if (paymentsData?.length) {
          setError(`Impossible de supprimer cette facture car elle a ${paymentsData.length} paiement(s) associé(s). Veuillez d'abord supprimer les paiements.`);
          return;
        }

        // Supprimer la facture
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setSuccess('Facture supprimée avec succès');
      } else if (type === 'quote') {
        // Vérifier si le devis est lié à une facture
        // Supprimer le devis
        const { error } = await supabase
          .from('quotes')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setSuccess('Devis supprimé avec succès');
      } else if (type === 'payment') {
        // Supprimer le paiement
        const { error } = await supabase
          .from('invoice_payments')
          .delete()
          .eq('id', id);

        if (error) throw error;
        setSuccess('Paiement supprimé avec succès');
      }

      loadFinanceData();
    } catch (err) {
      console.error(`Error deleting ${type}:`, err);
      setError(`Erreur lors de la suppression : ${err instanceof Error ? err.message : 'Une erreur est survenue'}`);
    } finally {
      setConfirmDelete(null);
    }
  };

  const getConfirmDialogMessage = () => {
    if (!confirmDelete) return '';
    
    switch (confirmDelete.type) {
      case 'invoice':
        return 'Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.';
      case 'quote':
        return 'Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible.';
      case 'payment':
        return 'Êtes-vous sûr de vouloir supprimer ce paiement ? Cette action est irréversible.';
      default:
        return '';
    }
  };

  const getConfirmDialogTitle = () => {
    if (!confirmDelete) return '';
    
    switch (confirmDelete.type) {
      case 'invoice':
        return 'Supprimer la facture';
      case 'quote':
        return 'Supprimer le devis';
      case 'payment':
        return 'Supprimer le paiement';
      default:
        return '';
    }
  };

  if (isCreatingQuote) {
    return (
      <CreateQuotePage
        contacts={contacts}
        companies={companies}
        projects={projects}
        onSubmit={handleCreateQuote}
        onCancel={() => setIsCreatingQuote(false)}
      />
    );
  }

  const handleConvertQuoteToInvoice = async (quote: Quote) => {
    try {
      // Create invoice
      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          company_id: quote.companyId,
          contact_id: quote.contactId,
          project_id: quote.projectId,
          invoice_date: new Date().toISOString(),
          status: 'draft',
          total_amount: quote.totalAmount
        }])
        .select()
        .single();

      if (invoiceError) {
        setError('Erreur lors de la création de la facture');
        console.error('Error creating invoice:', invoiceError);
        return;
      }

      // Validate and prepare line items
      const validatedLines = quote.lines.map(line => ({
        invoice_id: newInvoice.id,
        description: line.description || '',
        quantity: Math.max(0.01, line.quantity),
        unit_price: Math.max(0, line.unitPrice)
      }));

      // Create invoice lines
      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(validatedLines);

      if (linesError) {
        setError('Erreur lors de la création des lignes de facture');
        console.error('Error creating invoice lines:', linesError);
        return;
      }

      // Update quote status
      const { error: updateError } = await supabase
        .from('quotes')
        .update({ status: 'accepted' })
        .eq('id', quote.id);

      if (updateError) {
        setError('Erreur lors de la mise à jour du statut du devis');
        console.error('Error updating quote status:', updateError);
        return;
      }

      setSuccess('Devis converti en facture avec succès');
      loadFinanceData();
    } catch (err) {
      setError('Une erreur est survenue lors de la conversion du devis en facture');
      console.error('Error during quote conversion:', err);
    }
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

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Receipt className="h-8 w-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-semibold text-gray-900">Finance</h1>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => {
              if (activeTab === 'invoices') {
                setIsInvoiceFormOpen(true);
              } else {
                setIsCreatingQuote(true);
              }
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            {activeTab === 'invoices' ? 'Nouvelle facture' : 'Nouveau devis'}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('invoices')}
              className={`${
                activeTab === 'invoices'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Factures
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`${
                activeTab === 'quotes'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Devis
            </button>
          </nav>
        </div>
      </div>

      {(isInvoiceFormOpen || editingInvoice) && (
        <div className="mb-6">
          <InvoiceForm
            contacts={contacts}
            companies={companies}
            projects={projects}
            initialData={editingInvoice}
            onSubmit={handleCreateInvoice}
            onCancel={() => {
              setIsInvoiceFormOpen(false);
              setEditingInvoice(undefined);
            }}
          />
        </div>
      )}

      {editingQuote && (
        <div className="mb-6">
          <QuoteForm
            contacts={contacts}
            companies={companies}
            projects={projects}
            initialData={editingQuote}
            onSubmit={handleUpdateQuote}
            onCancel={() => setEditingQuote(undefined)}
          />
        </div>
      )}

      {selectedInvoice && (
        <div className="mb-6">
          <PaymentForm
            totalAmount={selectedInvoice.totalAmount}
            remainingAmount={
              selectedInvoice.totalAmount -
              payments
                .filter(p => p.invoiceId === selectedInvoice.id)
                .reduce((sum, p) => sum + p.amountPaid, 0)
            }
            onSubmit={handleAddPayment}
            onCancel={() => setSelectedInvoice(undefined)}
          />
        </div>
      )}

      {activeTab === 'invoices' ? (
        <InvoiceList
          invoices={invoices}
          contacts={contacts}
          projects={projects}
          payments={payments}
          onSelectInvoice={setSelectedInvoice}
          onEdit={setEditingInvoice}
          onDelete={(id) => handleDeleteClick('invoice', id)}
          onDeletePayment={(id) => handleDeleteClick('payment', id)}
        />
      ) : (
        <QuoteList
          quotes={quotes}
          contacts={contacts}
          projects={projects}
          onEdit={setEditingQuote}
          onDelete={(id) => handleDeleteClick('quote', id)}
          onConvertToInvoice={handleConvertQuoteToInvoice}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title={getConfirmDialogTitle()}
        message={getConfirmDialogMessage()}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDelete(null)}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        type="danger"
      />
    </div>
  );
}