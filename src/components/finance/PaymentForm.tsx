import React from 'react';
import { PaymentFormData, PaymentMethod } from '../../types/finance';
import { Calendar, CreditCard } from 'lucide-react';

interface PaymentFormProps {
  totalAmount: number;
  remainingAmount: number;
  onSubmit: (data: PaymentFormData) => void;
  onCancel: () => void;
}

export function PaymentForm({ totalAmount, remainingAmount, onSubmit, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = React.useState<PaymentFormData>({
    paymentDate: new Date().toISOString().split('T')[0],
    amountPaid: remainingAmount,
    paymentMethod: 'bank_transfer',
  });
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate payment amount
    if (!formData.amountPaid || formData.amountPaid <= 0) {
      setError('Le montant du paiement doit être supérieur à 0');
      return;
    }

    if (formData.amountPaid > remainingAmount) {
      setError('Le montant du paiement ne peut pas dépasser le montant restant dû');
      return;
    }

    onSubmit(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'amountPaid' ? parseFloat(value) : value,
    }));
  };

  const paymentMethods: { value: PaymentMethod; label: string }[] = [
    { value: 'cash', label: 'Espèces' },
    { value: 'bank_transfer', label: 'Virement bancaire' },
    { value: 'check', label: 'Chèque' },
    { value: 'credit_card', label: 'Carte bancaire' },
  ];

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-6">
        <CreditCard className="h-6 w-6 text-indigo-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">
          Enregistrer un paiement
        </h2>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Montant total</div>
          <div className="text-lg font-medium text-gray-900">
            {formatAmount(totalAmount)}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500">Reste à payer</div>
          <div className="text-lg font-medium text-gray-900">
            {formatAmount(remainingAmount)}
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
          Date du paiement
        </label>
        <div className="mt-1 relative">
          <input
            type="date"
            name="paymentDate"
            id="paymentDate"
            required
            value={formData.paymentDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="amountPaid" className="block text-sm font-medium text-gray-700">
          Montant payé
        </label>
        <div className="mt-1">
          <input
            type="number"
            name="amountPaid"
            id="amountPaid"
            required
            min="0.01"
            max={remainingAmount}
            step="0.01"
            value={formData.amountPaid}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
          Moyen de paiement
        </label>
        <select
          name="paymentMethod"
          id="paymentMethod"
          required
          value={formData.paymentMethod}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes (optionnel)
        </label>
        <textarea
          name="notes"
          id="notes"
          rows={3}
          value={formData.notes || ''}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="flex items-center">
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Enregistrement...
            </div>
          ) : (
            'Enregistrer le paiement'
          )}
        </button>
      </div>
    </div>
  );
}