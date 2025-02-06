import React from 'react';
import { Quote } from '../../types/finance';
import { Contact } from '../../types/contact';
import { Project } from '../../types/project';
import { Edit, Trash2, FileText, User, Calendar, Receipt, FileDown } from 'lucide-react';
import { generateQuotePdf } from '../../utils/pdf';
import quoteTemplate from '../../templates/quote.html?raw';

interface QuoteListProps {
  quotes: Quote[];
  contacts: Contact[];
  projects: Project[];
  onEdit: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onConvertToInvoice: (quote: Quote) => void;
  onExportPdf?: (quote: Quote) => void;
}

function QuoteList({ quotes, contacts, projects, onEdit, onDelete, onConvertToInvoice, onExportPdf }: QuoteListProps) {
  const getContactName = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : 'Contact inconnu';
  };

  const getProjectName = (projectId: string | null) => {
    if (!projectId) return '';
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : '';
  };

  const getStatusColor = (status: Quote['status']) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status];
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

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Devis
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
              Statut
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {quotes.map((quote) => (
            <tr key={quote.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    Devis #{quote.id.slice(0, 8)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400" />
                  <div className="ml-2">
                    <div className="text-sm text-gray-900">
                      {getContactName(quote.contactId)}
                    </div>
                    {quote.projectId && (
                      <div className="text-sm text-gray-500">
                        {getProjectName(quote.projectId)}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-900">
                    {formatDate(quote.quoteDate)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm font-medium text-gray-900">
                  {formatAmount(quote.totalAmount)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => {
                    const contact = contacts.find(c => c.id === quote.contactId);
                    if (contact) {
                      generateQuotePdf(quote, contact, quoteTemplate);
                    }
                  }}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Exporter en PDF"
                >
                  <FileDown className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onConvertToInvoice(quote)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                  title="Convertir en facture"
                >
                  <Receipt className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onEdit(quote)}
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDelete(quote.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { QuoteList };