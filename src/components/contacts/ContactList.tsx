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
      <td className="pl-10 pr-3 py-4 truncate">
        <div className="flex items-center">
          <UserCircle className="h-8 w-8 text-gray-400 flex-shrink-0" />
          <div className="ml-3 truncate">
            <div className="text-sm font-medium text-gray-900 truncate">
              {contact.firstName} {contact.lastName}
            </div>
          </div>
        </div>
      </td>
      <td className="px-3 py-4 truncate">
        <div className="text-sm text-gray-900 truncate">{contact.email}</div>
        {contact.phone && (
          <div className="text-sm text-gray-500 truncate">{contact.phone}</div>
        )}
      </td>
      <td className="px-3 py-4 truncate">
        <div className="flex items-center">
          <Building2 className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
          <span className={`text-sm truncate ${
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
      <td className="px-3 py-4">
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
      <td className="px-3 py-4 text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(contact)}
            className="text-indigo-600 hover:text-indigo-900"
            title="Modifier"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="text-red-600 hover:text-red-900"
            title="Supprimer"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderCompany = (company: Company) => {
    const companyContacts = contactsByCompany.get(company.id) || [];
    const isExpanded = expandedCompanies.has(company.id);

    return (
      <React.Fragment key={company.id}>
        <tr className="bg-gray-50 hover:bg-gray-100 cursor-pointer" onClick={() => toggleCompany(company.id)}>
          <td colSpan={4} className="px-3 py-4 truncate">
            <div className="flex items-center">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
              )}
              <Building2 className="h-8 w-8 text-gray-400 flex-shrink-0" />
              <div className="ml-3 flex-1 truncate">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {company.name}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditCompany(company);
                }}
                className="text-indigo-600 hover:text-indigo-900 flex-shrink-0"
                title="Modifier"
              >
                <Edit className="h-5 w-5" />
              </button>
            </div>
          </td>
          <td colSpan={1}></td>
        </tr>
        {isExpanded && companyContacts.map(contact => renderContact(contact))}
      </React.Fragment>
    );
  };

  const unassignedContacts = contactsByCompany.get(null) || [];

  return (
    <div className="bg-white shadow-md rounded-lg w-full">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom
            </th>
            <th className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entreprise
            </th>
            <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Température
            </th>
            <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map(company => renderCompany(company))}
          {unassignedContacts.length > 0 && (
            <>
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Contacts sans entreprise
                </td>
                <td colSpan={1}></td>
              </tr>
              {unassignedContacts.map(contact => renderContact(contact))}
            </>
          )}
        </tbody>
      </table>
    </div>
  );
}