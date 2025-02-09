import React from 'react';
import { Invoice } from '../../types/finance';
import { Contact } from '../../types/contact';
import { Project } from '../../types/project';
import { Payment, PaymentMethod } from '../../types/finance';
import { Edit, Trash2, FileText, User, Calendar, Euro, FileDown, Plus } from 'lucide-react';
import { generateInvoicePdf } from '../../utils/pdf'; 
import invoiceTemplate from '../../templates/invoice.html?raw';

interface InvoiceListProps {
  invoices: Invoice[];
  contacts: Contact[];
  projects: Project[];
  payments: Payment[];
  onSelectInvoice: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (id: string) => void;
  onDeletePayment: (id: string) => void;
  onExportPdf?: (invoice: Invoice) => void;
}

export function InvoiceList({ invoices, contacts, projects, payments, onSelectInvoice, onEdit, onDelete, onDeletePayment }: InvoiceListProps) {
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Contact inconnu';
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '';
  };

  const getStatusColor = (status: Invoice['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status];
  };

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    const labels = {
      cash: 'Espèces',
      bank_transfer: 'Virement bancaire',
      check: 'Chèque',
      credit_card: 'Carte bancaire',
    };
    return labels[method];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getRemainingAmount = (invoice: Invoice) => {
    if (invoice.status === 'paid') return 0;
    
    const totalPaid = payments
      .filter(p => p.invoiceId === invoice.id)
      .reduce((sum, payment) => sum + payment.amountPaid, 0);
    
    return Math.max(0, invoice.totalAmount - totalPaid);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Facture
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reste à payer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <React.Fragment key={invoice.id}>
              <tr key={invoice.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm font-medium text-gray-900">
                      Facture #{invoice.id.slice(0, 8)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400" />
                    <div className="ml-2">
                      <div className="text-sm text-gray-900">
                        {getContactName(invoice.contactId)}
                      </div>
                      {invoice.projectId && (
                        <div className="text-sm text-gray-500">
                          {getProjectName(invoice.projectId)}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <span className="ml-2 text-sm text-gray-900">
                      {formatDate(invoice.invoiceDate)}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {formatAmount(invoice.totalAmount)}
                  </span>
                  {invoice.status !== 'paid' && (
                    <button
                      onClick={() => onSelectInvoice(invoice)}
                      className="ml-2 text-indigo-600 hover:text-indigo-900"
                      title="Ajouter un paiement"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Euro className="h-5 w-5 text-gray-400 mr-2" />
                    <span className={`text-sm font-medium ${
                      invoice.status === 'paid' 
                        ? 'text-green-600' 
                        : getRemainingAmount(invoice) < invoice.totalAmount
                          ? 'text-orange-600' 
                          : 'text-gray-900' 
                    }`}>
                      {formatAmount(getRemainingAmount(invoice))}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      const contact = contacts.find(c => c.id === invoice.contactId);
                      const company = companies.find(c => c.id === invoice.companyId);
                      if (contact && company) {
                        generateInvoicePdf(
                          invoice,
                          contact,
                          company,
                          payments.filter(p => p.invoiceId === invoice.id),
                          invoiceTemplate
                        );
                      }
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    title="Exporter en PDF"
                  >
                    <FileDown className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEdit(invoice)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                    title="Modifier"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(invoice.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
              {/* Payment details */}
              {payments.filter(p => p.invoiceId === invoice.id).length > 0 && (
                <tr className="bg-gray-50">
                  <td colSpan={7} className="px-6 py-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Paiements</h4>
                      {payments
                        .filter(p => p.invoiceId === invoice.id)
                        .map(payment => (
                          <div key={payment.id} className="flex items-center justify-between text-sm text-gray-600 bg-white p-2 rounded">
                            <div className="flex items-center space-x-4">
                              <span>{formatDate(payment.paymentDate)}</span>
                              <span>{getPaymentMethodLabel(payment.paymentMethod)}</span>
                              <span className="font-medium">{formatAmount(payment.amountPaid)}</span>
                              {payment.notes && <span className="text-gray-500">({payment.notes})</span>}
                            </div>
                            <button
                              onClick={() => onDeletePayment(payment.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Supprimer le paiement"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
              Total
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-900">
                {formatAmount(invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0))}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-sm font-medium text-gray-900">
                {formatAmount(invoices.reduce((sum, invoice) => {
                  if (invoice.status === 'paid') return sum;
                  return sum + getRemainingAmount(invoice);
                }, 0))}
              </span>
            </td>
            <td colSpan={2}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}