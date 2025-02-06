import React from 'react';
import { DocumentLineFormData } from '../../types/finance';
import { Plus, X } from 'lucide-react';

interface DocumentLineFormProps {
  lines: DocumentLineFormData[];
  onChange: (lines: DocumentLineFormData[]) => void;
}

export function DocumentLineForm({ lines, onChange }: DocumentLineFormProps) {
  const handleAddLine = () => {
    onChange([...lines, { 
      description: '',
      quantity: 1,
      unitPrice: 0.00
    }]);
  };

  const handleRemoveLine = (index: number) => {
    onChange(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof DocumentLineFormData, value: string | number) => {
    const newLines = [...lines];
    let parsedValue = value;
    
    // Ensure numeric fields have valid values
    if (field === 'quantity' || field === 'unitPrice') {
      parsedValue = Math.max(0.01, parseFloat(value as string) || 0);
    }
    
    newLines[index] = {
      ...newLines[index],
      [field]: parsedValue
    };
    onChange(newLines);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Lignes</h3>
      </div>

      <div className="space-y-4">
        {lines.map((line, index) => (
          <div key={index} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
            <div className="flex-1">
              <input
                type="text"
                value={line.description}
                onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                placeholder="Description"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={line.quantity}
                onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                min="0.01"
                step="0.01"
                placeholder="Quantité"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-32">
              <input
                type="number"
                value={line.unitPrice}
                onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                min="0"
                step="0.01"
                placeholder="Prix unitaire"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div className="w-32 flex items-center">
              <span className="text-sm text-gray-700">
                {formatAmount(line.quantity * line.unitPrice)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleRemoveLine(index)}
              className="text-red-600 hover:text-red-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddLine}
        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <Plus className="h-4 w-4 mr-2" />
        Ajouter une ligne
      </button>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <div className="text-right">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-lg font-medium text-gray-900">
            {formatAmount(lines.reduce((sum, line) => sum + (line.quantity * line.unitPrice), 0))}
          </p>
        </div>
      </div>
    </div>
  );
}