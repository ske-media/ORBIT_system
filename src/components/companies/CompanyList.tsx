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
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Entreprise
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Localisation
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contacts
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {companies.map((company) => {
            const companyContacts = getCompanyContacts(company.id);
            return (
              <tr key={company.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Building2 className="h-10 w-10 text-gray-400" />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {company.name}
                      </div>
                      {company.siret && (
                        <div className="text-sm text-gray-500">
                          SIRET : {company.siret}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    {company.phone && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="h-4 w-4 mr-2" />
                        {company.phone}
                      </div>
                    )}
                    {company.email && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Mail className="h-4 w-4 mr-2" />
                        {company.email}
                      </div>
                    )}
                    {company.website && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Globe className="h-4 w-4 mr-2" />
                        {company.website}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {company.address}
                  </div>
                  {(company.postal_code || company.city || company.country) && (
                    <div className="text-sm text-gray-500">
                      {company.postal_code} {company.city}{company.country && `, ${company.country}`}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">
                      {companyContacts.length} contact{companyContacts.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onEdit(company)}
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mr-4 p-2 rounded-md hover:bg-indigo-50"
                    title="Modifier"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onDelete(company.id)}
                    className="inline-flex items-center text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}