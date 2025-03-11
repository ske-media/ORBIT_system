import React from 'react';
import { Company } from '../../types/company';
import { Contact } from '../../types/contact';
import { Edit, Trash2, Building2, Phone, Mail, Globe, Users, AlertCircle } from 'lucide-react';

interface CompanyListProps {
  companies: Company[];
  contacts: Contact[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export function CompanyList({ companies, contacts, onEdit, onDelete }: CompanyListProps) {
  const getCompanyContacts = (companyId: string) => {
    return contacts.filter(contact => contact.companyId === companyId);
  };

  return (
    <div className="bg-white shadow-md rounded-lg w-full">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entreprise
            </th>
            <th className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="w-1/4 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Localisation
            </th>
            <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacts
            </th>
            <th className="w-1/6 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company) => {
            const companyContacts = getCompanyContacts(company.id);
            return (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-3 py-4 truncate">
                  <div className="flex items-center">
                    <Building2 className="h-8 w-8 text-gray-400 flex-shrink-0" />
                    <div className="ml-3 truncate">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {company.name}
                      </div>
                      {company.siret && (
                        <div className="text-sm text-gray-500 truncate">
                          SIRET : {company.siret}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 truncate">
                  <div className="space-y-1">
                    {company.phone && (
                      <div className="flex items-center text-sm text-gray-500 truncate">
                        <Phone className="h-4 w-4 flex-shrink-0 mr-1" />
                        <span className="truncate">{company.phone}</span>
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center text-sm text-gray-500 truncate">
                        <Mail className="h-4 w-4 flex-shrink-0 mr-1" />
                        <span className="truncate">{company.email}</span>
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center text-sm text-gray-500 truncate">
                        <Globe className="h-4 w-4 flex-shrink-0 mr-1" />
                        <span className="truncate">{company.website}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4 truncate">
                  <div className="text-sm text-gray-900 truncate">
                    {company.address}
                  </div>
                  {(company.postal_code || company.city || company.country) && (
                    <div className="text-sm text-gray-500 truncate">
                      {company.postal_code} {company.city}{company.country && `, ${company.country}`}
                    </div>
                  )}
                </td>
                <td className="px-3 py-4 truncate">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 flex-shrink-0 mr-1" />
                    <span className="text-sm text-gray-900 truncate">
                      {companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(company)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Modifier"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => onDelete(company.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}