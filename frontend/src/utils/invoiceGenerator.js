import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateInvoicePDF = (invoice, company = {}) => {
  const doc = new jsPDF();
  
  // Company details (can be configured)
  const companyDetails = {
    name: company.name || 'ChemExport Trading & Export Company',
    address: company.address || '123 Chemical Industrial Zone',
    city: company.city || 'Export City, India',
    email: company.email || 'export@chemexport.com',
    phone: company.phone || '+91-XXX-XXXXXXX',
    iec: company.iec || 'AAACX1234E',
    gst: company.gst || '27AAACX1234E1Z5',
    pan: company.pan || 'AAACX1234E'
  };
  
  // Header with company logo area
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text(companyDetails.name, 15, 20);
  
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(companyDetails.address, 15, 27);
  doc.text(companyDetails.city, 15, 32);
  
  // Invoice Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('INVOICE', 160, 25);
  
  // Invoice Details Box
  doc.setFillColor(241, 245, 249);
  doc.rect(140, 45, 60, 30, 'F');
  
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Invoice Number:', 145, 52);
  doc.setFont(undefined, 'normal');
  doc.text(invoice.invoice_number || 'N/A', 145, 57);
  
  doc.setFont(undefined, 'bold');
  doc.text('Invoice Date:', 145, 63);
  doc.setFont(undefined, 'normal');
  doc.text(new Date(invoice.invoice_date).toLocaleDateString(), 145, 68);
  
  doc.setFont(undefined, 'bold');
  doc.text('Due Date:', 145, 73);
  doc.setFont(undefined, 'normal');
  doc.text(new Date(invoice.due_date).toLocaleDateString(), 145, 78);
  
  // Company Details Section
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('From:', 15, 55);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(companyDetails.name, 15, 61);
  doc.text(companyDetails.address, 15, 66);
  doc.text(companyDetails.city, 15, 71);
  doc.text(`Email: ${companyDetails.email}`, 15, 76);
  doc.text(`Phone: ${companyDetails.phone}`, 15, 81);
  doc.text(`IEC: ${companyDetails.iec} | GST: ${companyDetails.gst}`, 15, 86);
  doc.text(`PAN: ${companyDetails.pan}`, 15, 91);
  
  // Customer Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Bill To:', 15, 105);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text(invoice.customer_name || 'N/A', 15, 111);
  const addressLines = doc.splitTextToSize(invoice.billing_address || 'N/A', 80);
  doc.text(addressLines, 15, 116);
  doc.text(`Email: ${invoice.customer_email || 'N/A'}`, 15, 116 + (addressLines.length * 5));
  
  // Sales Order Reference
  if (invoice.sales_order_id) {
    doc.setFont(undefined, 'bold');
    doc.text('Sales Order:', 110, 105);
    doc.setFont(undefined, 'normal');
    doc.text(invoice.sales_order_id || 'N/A', 110, 111);
  }
  
  // Items Table
  const tableStartY = 140;
  const itemData = [[
    '1',
    invoice.product || 'Chemical Product',
    `${invoice.quantity || 0} KG`,
    `${invoice.currency} ${invoice.unit_price?.toFixed(2) || '0.00'}`,
    `${invoice.currency} ${invoice.subtotal?.toFixed(2) || '0.00'}`
  ]];
  
  doc.autoTable({
    startY: tableStartY,
    head: [['#', 'Description', 'Quantity', 'Unit Price', 'Amount']],
    body: itemData,
    theme: 'grid',
    headStyles: { 
      fillColor: [15, 23, 42], 
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 9,
      cellPadding: 5
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { halign: 'left', cellWidth: 70 },
      2: { halign: 'center', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 35 },
      4: { halign: 'right', cellWidth: 40 }
    },
  });
  
  // Totals Section
  const finalY = doc.lastAutoTable.finalY + 10;
  const totalsX = 140;
  
  doc.setFontSize(9);
  
  // Subtotal
  doc.setFont(undefined, 'normal');
  doc.text('Subtotal:', totalsX, finalY);
  doc.text(`${invoice.currency} ${invoice.subtotal?.toFixed(2) || '0.00'}`, 190, finalY, { align: 'right' });
  
  // Tax
  if (invoice.tax_amount && invoice.tax_amount > 0) {
    doc.text(`Tax (${((invoice.tax_amount / invoice.subtotal) * 100).toFixed(1)}%):`, totalsX, finalY + 6);
    doc.text(`${invoice.currency} ${invoice.tax_amount?.toFixed(2) || '0.00'}`, 190, finalY + 6, { align: 'right' });
  }
  
  // Total
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(totalsX, finalY + 10, 195, finalY + 10);
  
  doc.setFont(undefined, 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, finalY + 18);
  doc.text(`${invoice.currency} ${invoice.total_amount?.toFixed(2) || '0.00'}`, 190, finalY + 18, { align: 'right' });
  
  // Notes section
  if (invoice.notes) {
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Notes:', 15, finalY + 35);
    doc.setFont(undefined, 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, 170);
    doc.text(notesLines, 15, finalY + 40);
  }
  
  // Payment Terms
  const termsY = invoice.notes ? finalY + 55 : finalY + 35;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Payment Terms:', 15, termsY);
  doc.setFont(undefined, 'normal');
  doc.text(`• Payment due within 30 days from invoice date`, 15, termsY + 5);
  doc.text(`• All payments to be made in ${invoice.currency}`, 15, termsY + 10);
  doc.text('• Please include invoice number in payment reference', 15, termsY + 15);
  doc.text('• Bank details available upon request', 15, termsY + 20);
  
  // Footer
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 270, 210, 27, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });
  doc.text(`${companyDetails.email} | ${companyDetails.phone}`, 105, 286, { align: 'center' });
  doc.text('This is a computer generated invoice and does not require signature', 105, 292, { align: 'center' });
  
  return doc;
};

export const downloadInvoice = (invoice, company) => {
  const doc = generateInvoicePDF(invoice, company);
  doc.save(`invoice-${invoice.invoice_number}.pdf`);
};

export const previewInvoice = (invoice, company) => {
  const doc = generateInvoicePDF(invoice, company);
  window.open(doc.output('bloburl'), '_blank');
};