import React from 'react';
import { Invoice, Quote } from '../../types/finance';
import { Contact } from '../../types/contact';
import { Project } from '../../types/project';
import { Euro, Users, FolderKanban, FileText } from 'lucide-react';

interface DashboardStatsProps {
  invoices: Invoice[];
  quotes: Quote[];
  contacts: Contact[];
  projects: Project[];
}

export function DashboardStats({ invoices, quotes, contacts, projects }: DashboardStatsProps) {
  // Calcul du total des factures du mois en cours
  const currentMonthInvoices = invoices.filter(invoice => {
    const invoiceDate = new Date(invoice.invoiceDate);
    const now = new Date();
    return invoiceDate.getMonth() === now.getMonth() && 
           invoiceDate.getFullYear() === now.getFullYear();
  });

  const totalInvoicesThisMonth = currentMonthInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0
  );

  // Calcul du total des factures payées
  const totalPaidInvoices = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.totalAmount, 0);

  // Nombre de devis en cours
  const activeQuotes = quotes.filter(
    quote => quote.status === 'draft' || quote.status === 'sent'
  ).length;

  // Nombre total de contacts
  const totalContacts = contacts.length;

  // Nombre de projets en cours
  const activeProjects = projects.filter(
    project => project.status === 'in_progress' || project.status === 'not_started'
  ).length;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const stats = [
    {
      name: 'Factures ce mois-ci',
      value: formatAmount(totalInvoicesThisMonth),
      icon: Euro,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total payé',
      value: formatAmount(totalPaidInvoices),
      icon: Euro,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Devis en cours',
      value: activeQuotes,
      icon: FileText,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      name: 'Contacts',
      value: totalContacts,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Projets en cours',
      value: activeProjects,
      icon: FolderKanban,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.name}
            className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex items-center"
          >
            <div className={`${stat.bgColor} rounded-lg p-3 mr-4`}>
              <Icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.name}</p>
              <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  );
}