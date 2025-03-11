import React from 'react';
import { Payment } from '../../types/finance';
import { Calendar, CreditCard, Trash2 } from 'lucide-react';

interface PaymentListProps {
  payments: Payment[];
  onDelete: (id: string) => void;
}

export function PaymentList({ payments, onDelete }: PaymentListProps) {
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

  const getPaymentMethodLabel = (method: Payment['paymentMethod']) => {
    const labels = {
      cash: 'Espèces',
      bank_transfer: 'Virement bancaire',
      check: 'Chèque',
      credit_card: 'Carte bancaire',
    };
    return labels[method];
  };

  return (
    <div className="bg-white shadow-md rounded-lg w-full">
      <table className="w-full table-fixed divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-1/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="w-1/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Montant
            </th>
            <th className="w-1/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Moyen de paiement
            </th>
            <th className="w-2/5 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Notes
            </th>
            <th className="w-1/10 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-3 py-4 truncate">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-900 truncate">
                    {formatDate(payment.paymentDate)}
                  </span>
                </div>
              </td>
              <td className="px-3 py-4 truncate">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {formatAmount(payment.amountPaid)}
                </span>
              </td>
              <td className="px-3 py-4 truncate">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-gray-400 flex-shrink-0 mr-2" />
                  <span className="text-sm text-gray-900 truncate">
                    {getPaymentMethodLabel(payment.paymentMethod)}
                  </span>
                </div>
              </td>
              <td className="px-3 py-4 truncate">
                <span className="text-sm text-gray-500 truncate">
                  {payment.notes || '-'}
                </span>
              </td>
              <td className="px-3 py-4 text-sm font-medium">
                <button
                  onClick={() => onDelete(payment.id)}
                  className="text-red-600 hover:text-red-900"
                  title="Supprimer"
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