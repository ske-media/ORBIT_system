import React from 'react';
import { Contact } from '../../types/contact';
import { Company } from '../../types/company';
import { Edit, Trash2, UserCircle, Building2, ChevronDown, ChevronRight } from 'lucide-react';

interface ContactListProps {
  contacts: Contact[];
  companies: Company[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
  onEditCompany: (company: Company) => void;
}

export function ContactList({ contacts, companies, onEdit, onDelete, onEditCompany }: ContactListProps) {
  const [expandedCompanies, setExpandedCompanies] = React.useState<Set<string>>(new Set());

  const toggleCompany = (companyId: string) => {
    const newExpanded = new Set(expandedCompanies);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedCompanies(newExpanded);
  };

  const contactsByCompany = React.useMemo(() => {
    const grouped = new Map<string | null, Contact[]>();
    
    // Initialize with companies that have no contacts
    companies.forEach(company => {
      grouped.set(company.id, []);
    });
    
    // Add contacts to their respective companies
    contacts.forEach(contact => {
      const companyId = contact.companyId || null;
      if (!grouped.has(companyId)) {
        grouped.set(companyId, []);
      }
      grouped.get(companyId)!.push(contact);
    });
    
    return grouped;
  }, [contacts, companies]);

  const renderContact = (contact: Contact) => (
    <tr key={contact.id} className="hover:bg-gray-50">
      <td className="pl-16 pr-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <UserCircle className="h-10 w-10 text-gray-400" />
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {contact.firstName} {contact.lastName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{contact.email}</div>
        {contact.phone && (
          <div className="text-sm text-gray-500">{contact.phone}</div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 mr-2" />
          <span className={`text-sm ${
            contact.companyId 
              ? 'text-gray-900' 
              : 'text-gray-500 italic'
          }`}>
            {contact.companyId 
              ? companies.find(c => c.id === contact.companyId)?.name 
              : 'Non attribué'}
          </span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
          ${contact.temperature === 'hot' ? 'bg-red-100 text-red-800' : ''}
          ${contact.temperature === 'warm' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${contact.temperature === 'cold' ? 'bg-blue-100 text-blue-800' : ''}
          ${contact.temperature === 'client' ? 'bg-green-100 text-green-800' : ''}`}>
          {contact.temperature === 'cold' ? 'Froid' :
           contact.temperature === 'warm' ? 'Tiède' :
           contact.temperature === 'hot' ? 'Chaud' :
           contact.temperature === 'client' ? 'Client' : contact.temperature}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <button
          onClick={() => onEdit(contact)}
          className="text-indigo-600 hover:text-indigo-900 mr-4"
        >
          <Edit className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(contact.id)}
          className="text-red-600 hover:text-red-900"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </td>
    </tr>
  );

  const renderCompany = (company: Company) => {
    const companyContacts = contactsByCompany.get(company.id) || [];
    const isExpanded = expandedCompanies.has(company.id);

    return (
      <React.Fragment key={company.id}>
        <tr className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleCompany(company.id)}>
          <td className="px-6 py-4 whitespace-nowrap" colSpan={4}>
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400 mr-2" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400 mr-2" />
              )}
              <Building2 className="h-10 w-10 text-gray-400" />
              <div className="ml-4 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {company.name}
                </div>
                <div className="text-sm text-gray-500">
                  {companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCompany(company);
                }}
                className="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && companyContacts.map(contact => renderContact(contact))}
      </React.Fragment>
    );
  };

  const unassignedContacts = contactsByCompany.get(null) || [];

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entreprise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Température
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map(company => renderCompany(company))}
          {unassignedContacts.length > 0 && (
            <>
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contacts sans entreprise
                </td>
              </tr>
              {unassignedContacts.map(contact => renderContact(contact))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}