import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import invoiceTemplate from '../templates/invoice.html?raw';
import quoteTemplate from '../templates/quote.html?raw';

// Configuration de l'entreprise
const COMPANY_CONFIG = {
  name: 'Votre Entreprise',
  address: '123 rue des Entreprises',
  postal_code: '75000',
  city: 'Paris',
  phone: '01 23 45 67 89',
  email: 'contact@votreentreprise.fr',
  siret: '123 456 789 00012',
  vat: 'FR12345678900',
  legal_form: 'SARL',
  capital: '10000',
  rcs: 'Paris B 123 456 789',
  logo: '/logo.png', // À remplacer par le chemin de votre logo
  late_payment_rate: 10.15, // Taux des pénalités de retard
  payment_terms: '30 jours',
  vat_rate: 20, // Taux de TVA en %
};

// Formater un montant en euros
const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Formater une date
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Obtenir le libellé d'un mode de paiement
const getPaymentMethodLabel = (method: Payment['paymentMethod']): string => {
  const labels: Record<Payment['paymentMethod'], string> = {
    cash: 'Espèces',
    bank_transfer: 'Virement bancaire',
    check: 'Chèque',
    credit_card: 'Carte bancaire',
  };
  return labels[method];
};

export async function generateInvoicePdf(
  invoice: Invoice,
  contact: Contact,
  company: Company,
  payments: Payment[],
  template: string
): Promise<void> {
  // Calculer les totaux
  const totalExclTax = invoice.totalAmount;
  const vatAmount = totalExclTax * (COMPANY_CONFIG.vat_rate / 100);
  const totalInclTax = totalExclTax + vatAmount;

  // Calculer les paiements
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amountPaid, 0);
  const remainingAmount = Math.max(0, totalInclTax - totalPaid);

  // Préparer les données pour le template
  const data = {
    // Informations de l'entreprise émettrice
    company_name: 'Votre Entreprise',
    company_address: '123 rue des Entreprises',
    company_postal_code: '75000',
    company_city: 'Paris',
    company_phone: '01 23 45 67 89',
    company_email: 'contact@votreentreprise.fr',
    company_siret: '123 456 789 00012',
    company_vat: 'FR12345678900',
    company_legal_form: 'SARL',
    company_capital: '10000',
    company_rcs: 'Paris B 123 456 789',
    
    // Informations de la facture
    invoice_number: invoice.id.slice(0, 8).toUpperCase(),
    invoice_date: formatDate(invoice.invoiceDate),
    due_date: formatDate(new Date(invoice.invoiceDate).setDate(new Date(invoice.invoiceDate).getDate() + 30)),
    
    // Informations du client (entreprise)
    client_name: company.name,
    client_address: company.address || '',
    client_postal_code: company.postal_code || '',
    client_city: company.city || '',
    client_vat: company.vat || '',
    client_siret: company.siret || '',
    
    // Informations du contact
    contact_name: `${contact.firstName} ${contact.lastName}`,
    contact_email: contact.email || '',
    contact_phone: contact.phone || '',
    
    // Lignes de la facture
    lines: invoice.lines.map(line => ({
      description: line.description,
      quantity: formatAmount(line.quantity),
      unit_price: formatAmount(line.unitPrice),
      total: formatAmount(line.quantity * line.unitPrice),
    })),
    
    // Totaux
    total_excl_tax: formatAmount(totalExclTax),
    vat_rate: COMPANY_CONFIG.vat_rate,
    vat_amount: formatAmount(vatAmount),
    total_incl_tax: formatAmount(totalInclTax),
    
    // Paiements
    payments: payments.map(payment => ({
      date: formatDate(payment.paymentDate),
      method: getPaymentMethodLabel(payment.paymentMethod),
      amount: formatAmount(payment.amountPaid),
    })),
    total_paid: formatAmount(totalPaid),
    remaining_amount: formatAmount(remainingAmount),
  };

  // Remplacer les variables dans le template
  let html = template;
  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Générer le PDF
  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`facture_${invoice.id.slice(0, 8)}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}

export async function generateQuotePdf(
  quote: Quote,
  contact: Contact,
  company: Company,
  template: string
): Promise<void> {
  // Calculer les totaux
  const totalExclTax = quote.totalAmount;
  const vatAmount = totalExclTax * (COMPANY_CONFIG.vat_rate / 100);
  const totalInclTax = totalExclTax + vatAmount;

  // Calculer la date de validité (30 jours par défaut)
  const validityDate = new Date(quote.quoteDate);
  validityDate.setDate(validityDate.getDate() + 30);

  // Préparer les données pour le template
  const data = {
    // Informations de l'entreprise émettrice
    company_name: 'Votre Entreprise',
    company_address: '123 rue des Entreprises',
    company_postal_code: '75000',
    company_city: 'Paris',
    company_phone: '01 23 45 67 89',
    company_email: 'contact@votreentreprise.fr',
    company_siret: '123 456 789 00012',
    company_vat: 'FR12345678900',
    company_legal_form: 'SARL',
    company_capital: '10000',
    company_rcs: 'Paris B 123 456 789',
    
    // Informations du devis
    quote_number: quote.id.slice(0, 8).toUpperCase(),
    quote_date: formatDate(quote.quoteDate),
    validity_date: formatDate(validityDate.toISOString()),
    validity_duration: '30',
    
    // Informations du client (entreprise)
    client_name: company.name,
    client_address: company.address || '',
    client_postal_code: company.postal_code || '',
    client_city: company.city || '',
    client_vat: company.vat || '',
    client_siret: company.siret || '',
    
    // Informations du contact
    contact_name: `${contact.firstName} ${contact.lastName}`,
    contact_email: contact.email || '',
    contact_phone: contact.phone || '',
    
    // Lignes du devis
    lines: quote.lines.map(line => ({
      description: line.description,
      quantity: formatAmount(line.quantity),
      unit_price: formatAmount(line.unitPrice),
      total: formatAmount(line.quantity * line.unitPrice),
    })),
    
    // Totaux
    total_excl_tax: formatAmount(totalExclTax),
    vat_rate: COMPANY_CONFIG.vat_rate,
    vat_amount: formatAmount(vatAmount),
    total_incl_tax: formatAmount(totalInclTax),
  };

  // Remplacer les variables dans le template
  let html = template;
  Object.entries(data).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  // Générer le PDF
  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.appendChild(element);

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`devis_${quote.id.slice(0, 8)}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}