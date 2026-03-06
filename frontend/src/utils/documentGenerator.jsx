import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateCommercialInvoice = (order, shipment) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('COMMERCIAL INVOICE', 105, 20, { align: 'center' });

  // Company Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Ashoka Technovations', 20, 35);
  doc.text('123 Chemical Industrial Zone', 20, 40);
  doc.text('Export City, Country', 20, 45);
  doc.text('Email: contact@ashoka.com', 20, 50);

  // Invoice Details
  doc.setFont(undefined, 'bold');
  doc.text('Invoice Number:', 140, 35);
  doc.setFont(undefined, 'normal');
  doc.text(order.order_number || 'N/A', 180, 35);

  doc.setFont(undefined, 'bold');
  doc.text('Date:', 140, 40);
  doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleDateString(), 180, 40);

  // Buyer Details
  doc.setFont(undefined, 'bold');
  doc.text('BUYER:', 20, 65);
  doc.setFont(undefined, 'normal');
  doc.text(order.customer_name || '', 20, 70);

  // Shipment Details
  if (shipment) {
    doc.setFont(undefined, 'bold');
    doc.text('SHIPMENT DETAILS:', 20, 85);
    doc.setFont(undefined, 'normal');
    doc.text(`Port of Loading: ${shipment.port_of_loading || 'N/A'}`, 20, 90);
    doc.text(`Destination: ${shipment.destination_country || 'N/A'}`, 20, 95);
    doc.text(`Shipping Line: ${shipment.shipping_line || 'N/A'}`, 20, 100);
    doc.text(`Container No: ${shipment.container_number || 'N/A'}`, 20, 105);
    doc.text(`B/L Number: ${shipment.bl_number || 'N/A'}`, 20, 110);
  }

  // Product Table
  const tableData = [[
    '1',
    order.product || '',
    order.quantity ? `${order.quantity} KG` : '',
    order.total_amount ? `${order.currency} ${(order.total_amount / order.quantity).toFixed(2)}` : '',
    order.total_amount ? `${order.currency} ${order.total_amount.toLocaleString()}` : ''
  ]];

  doc.autoTable({
    startY: 120,
    head: [['S.No', 'Description', 'Quantity', 'Unit Price', 'Total Amount']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
  });

  // Total
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL AMOUNT:', 120, finalY);
  doc.text(`${order.currency || ''} ${order.total_amount ? order.total_amount.toLocaleString() : '0'}`, 170, finalY);

  // Terms
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  doc.text('Terms & Conditions:', 20, finalY + 15);
  doc.text('1. Payment terms as per contract', 20, finalY + 20);
  doc.text('2. All disputes subject to jurisdiction', 20, finalY + 25);

  // Signature
  doc.text('Authorized Signature: _________________', 20, finalY + 40);

  doc.save(`commercial-invoice-${order.order_number}.pdf`);
};

export const generatePackingList = (order, shipment) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('PACKING LIST', 105, 20, { align: 'center' });

  // Company Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Ashoka Technovations', 20, 35);
  doc.text('123 Chemical Industrial Zone', 20, 40);

  // Packing List Details
  doc.setFont(undefined, 'bold');
  doc.text('Packing List No:', 140, 35);
  doc.setFont(undefined, 'normal');
  doc.text(`PL-${order.order_number || 'N/A'}`, 180, 35);

  doc.setFont(undefined, 'bold');
  doc.text('Date:', 140, 40);
  doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleDateString(), 180, 40);

  // Consignee
  doc.setFont(undefined, 'bold');
  doc.text('CONSIGNEE:', 20, 55);
  doc.setFont(undefined, 'normal');
  doc.text(order.customer_name || '', 20, 60);

  // Shipment Info
  if (shipment) {
    doc.setFont(undefined, 'bold');
    doc.text('SHIPMENT INFORMATION:', 20, 75);
    doc.setFont(undefined, 'normal');
    doc.text(`Container No: ${shipment.container_number || 'N/A'}`, 20, 80);
    doc.text(`Seal No: [To be filled]`, 20, 85);
    doc.text(`Gross Weight: ${order.quantity || 0} KG`, 20, 90);
    doc.text(`Net Weight: ${order.quantity || 0} KG`, 20, 95);
  }

  // Packing Details Table
  const packingData = [[
    '1',
    order.product || '',
    '1',
    `${order.quantity || 0} KG`,
    'Drums/Bags',
    `${order.quantity || 0} KG`
  ]];

  doc.autoTable({
    startY: 105,
    head: [['S.No', 'Description', 'No. of Packages', 'Quantity per Package', 'Type of Package', 'Total Quantity']],
    body: packingData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
  });

  // Total Summary
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL PACKAGES: 1', 20, finalY);
  doc.text(`TOTAL GROSS WEIGHT: ${order.quantity || 0} KG`, 20, finalY + 5);
  doc.text(`TOTAL NET WEIGHT: ${order.quantity || 0} KG`, 20, finalY + 10);

  // Signature
  doc.text('Prepared By: _________________', 20, finalY + 30);
  doc.text('Authorized Signature: _________________', 120, finalY + 30);

  doc.save(`packing-list-${order.order_number}.pdf`);
};

export const generateBillOfLading = (shipment, order) => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('BILL OF LADING', 105, 20, { align: 'center' });

  // B/L Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('B/L Number:', 20, 35);
  doc.setFont(undefined, 'normal');
  doc.text(shipment.bl_number || 'N/A', 60, 35);

  doc.setFont(undefined, 'bold');
  doc.text('Date:', 140, 35);
  doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleDateString(), 160, 35);

  // Shipper
  doc.setFont(undefined, 'bold');
  doc.text('SHIPPER:', 20, 50);
  doc.setFont(undefined, 'normal');
  doc.text('Ashoka Technovations', 20, 55);
  doc.text('123 Chemical Industrial Zone', 20, 60);

  // Consignee
  doc.setFont(undefined, 'bold');
  doc.text('CONSIGNEE:', 20, 75);
  doc.setFont(undefined, 'normal');
  doc.text(order.customer_name || '', 20, 80);

  // Notify Party
  doc.setFont(undefined, 'bold');
  doc.text('NOTIFY PARTY:', 20, 95);
  doc.setFont(undefined, 'normal');
  doc.text('Same as Consignee', 20, 100);

  // Vessel & Voyage
  doc.setFont(undefined, 'bold');
  doc.text('VESSEL:', 120, 50);
  doc.setFont(undefined, 'normal');
  doc.text(shipment.shipping_line || 'N/A', 120, 55);

  doc.setFont(undefined, 'bold');
  doc.text('CONTAINER NO:', 120, 65);
  doc.setFont(undefined, 'normal');
  doc.text(shipment.container_number || 'N/A', 120, 70);

  // Port Details
  doc.setFont(undefined, 'bold');
  doc.text('PORT OF LOADING:', 20, 115);
  doc.setFont(undefined, 'normal');
  doc.text(shipment.port_of_loading || 'N/A', 20, 120);

  doc.setFont(undefined, 'bold');
  doc.text('PORT OF DISCHARGE:', 120, 115);
  doc.setFont(undefined, 'normal');
  doc.text(shipment.destination_country || 'N/A', 120, 120);

  // Cargo Details
  const cargoData = [[
    shipment.container_number || 'N/A',
    '1',
    order.product || '',
    `${order.quantity || 0} KG`,
    `${order.quantity || 0} KG`
  ]];

  doc.autoTable({
    startY: 135,
    head: [['Container No', 'No. of Packages', 'Description of Goods', 'Gross Weight', 'Net Weight']],
    body: cargoData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
  });

  // Freight & Charges
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'bold');
  doc.text('FREIGHT: Prepaid', 20, finalY);
  doc.text('NUMBER OF ORIGINAL B/L: 3', 20, finalY + 5);

  // Place & Date
  doc.text(`PLACE AND DATE OF ISSUE: ${new Date().toLocaleDateString()}`, 20, finalY + 20);

  // Signature
  doc.text('FOR THE CARRIER:', 20, finalY + 35);
  doc.text('_________________', 20, finalY + 50);
  doc.text('Authorized Signature', 20, finalY + 55);

  doc.save(`bill-of-lading-${shipment.shipment_id}.pdf`);
};