import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Customs Declaration Form
export const generateCustomsDeclaration = (shipment, order, inquiry) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('CUSTOMS DECLARATION', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('For Export of Chemical Products', 105, 28, { align: 'center' });

  // Declaration Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Declaration Number:', 20, 45);
  doc.setFont(undefined, 'normal');
  doc.text(`CD-${shipment.shipment_id}`, 70, 45);

  doc.setFont(undefined, 'bold');
  doc.text('Date:', 140, 45);
  doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleDateString(), 160, 45);

  // Exporter Details
  doc.setFont(undefined, 'bold');
  doc.text('EXPORTER DETAILS:', 20, 60);
  doc.setFont(undefined, 'normal');
  doc.text('Ashoka Technovations', 20, 67);
  doc.text('123 Chemical Industrial Zone, Export City', 20, 73);
  doc.text('IEC Code: AAACX1234E', 20, 79);
  doc.text('GST: 27AAACX1234E1Z5', 20, 85);

  // Consignee Details
  doc.setFont(undefined, 'bold');
  doc.text('CONSIGNEE DETAILS:', 20, 100);
  doc.setFont(undefined, 'normal');
  doc.text(order.customer_name || 'N/A', 20, 107);
  doc.text(shipment.destination_country || 'N/A', 20, 113);

  // Shipment Details
  doc.setFont(undefined, 'bold');
  doc.text('SHIPMENT DETAILS:', 20, 128);
  doc.setFont(undefined, 'normal');
  doc.text(`Port of Loading: ${shipment.port_of_loading || 'N/A'}`, 20, 135);
  doc.text(`Port of Discharge: ${shipment.destination_country || 'N/A'}`, 20, 141);
  doc.text(`Vessel/Flight: ${shipment.shipping_line || 'N/A'}`, 20, 147);
  doc.text(`Container No: ${shipment.container_number || 'N/A'}`, 20, 153);
  doc.text(`B/L Number: ${shipment.bl_number || 'N/A'}`, 20, 159);

  // Product Details Table
  const productData = [[
    '1',
    order.product || 'Chemical Product',
    'HS Code: 2815.11.00',
    `${order.quantity || 0} KG`,
    `${order.currency || 'USD'} ${order.total_amount || 0}`,
    shipment.destination_country || 'N/A'
  ]];

  doc.autoTable({
    startY: 170,
    head: [['S.No', 'Description of Goods', 'HS Code', 'Quantity', 'Value', 'Country of Origin']],
    body: productData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
  });

  // Declarations
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFont(undefined, 'bold');
  doc.text('DECLARATIONS:', 20, finalY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  doc.text('1. The goods are of Indian origin and conform to all quality standards', 20, finalY + 7);
  doc.text('2. All information provided is true and correct to the best of my knowledge', 20, finalY + 13);
  doc.text('3. The shipment complies with all export regulations and customs requirements', 20, finalY + 19);
  doc.text('4. The goods are properly classified under the declared HS Code', 20, finalY + 25);

  // Signature
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('Authorized Signatory', 20, finalY + 45);
  doc.text('_____________________', 20, finalY + 50);
  doc.text(`Place: Export City`, 20, finalY + 57);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, finalY + 63);

  doc.save(`customs-declaration-${shipment.shipment_id}.pdf`);
};

// Certificate of Origin
export const generateCertificateOfOrigin = (shipment, order) => {
  const doc = new jsPDF();

  // Border
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(2);
  doc.rect(10, 10, 190, 277);

  doc.setFontSize(22);
  doc.setFont(undefined, 'bold');
  doc.text('CERTIFICATE OF ORIGIN', 105, 30, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('(For Export of Chemical Products)', 105, 38, { align: 'center' });

  // Certificate Number
  doc.setFont(undefined, 'bold');
  doc.text('Certificate No:', 20, 55);
  doc.setFont(undefined, 'normal');
  doc.text(`COO-${shipment.shipment_id}`, 60, 55);

  doc.setFont(undefined, 'bold');
  doc.text('Issue Date:', 140, 55);
  doc.setFont(undefined, 'normal');
  doc.text(new Date().toLocaleDateString(), 170, 55);

  // Exporter
  doc.setFont(undefined, 'bold');
  doc.text('EXPORTER:', 20, 70);
  doc.setFont(undefined, 'normal');
  doc.text('Ashoka Technovations', 20, 77);
  doc.text('123 Chemical Industrial Zone', 20, 83);
  doc.text('Export City, India', 20, 89);

  // Consignee
  doc.setFont(undefined, 'bold');
  doc.text('CONSIGNEE:', 20, 105);
  doc.setFont(undefined, 'normal');
  doc.text(order.customer_name || 'N/A', 20, 112);
  doc.text(shipment.destination_country || 'N/A', 20, 118);

  // Means of Transport
  doc.setFont(undefined, 'bold');
  doc.text('MEANS OF TRANSPORT:', 20, 133);
  doc.setFont(undefined, 'normal');
  doc.text(`By Sea - ${shipment.shipping_line || 'N/A'}`, 20, 140);
  doc.text(`From: ${shipment.port_of_loading || 'N/A'}`, 20, 146);
  doc.text(`To: ${shipment.destination_country || 'N/A'}`, 20, 152);

  // Goods Description
  const goodsData = [[
    '1',
    order.product || 'Chemical Product',
    `${order.quantity || 0} KG`,
    'India',
    'HS: 2815.11.00'
  ]];

  doc.autoTable({
    startY: 165,
    head: [['Marks', 'Description of Goods', 'Quantity', 'Country of Origin', 'HS Code']],
    body: goodsData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255 },
  });

  // Certification Statement
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFont(undefined, 'bold');
  doc.text('CERTIFICATION:', 20, finalY);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  const certText = doc.splitTextToSize(
    'This is to certify that the goods described above originate in India and comply with the rules of origin ' +
    'requirements. The information provided is true and correct to the best of our knowledge.',
    170
  );
  doc.text(certText, 20, finalY + 7);

  // Stamp and Signature
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('For Ashoka Technovations', 20, finalY + 40);
  doc.text('_____________________', 20, finalY + 55);
  doc.text('Authorized Signatory', 20, finalY + 62);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, finalY + 69);

  // Chamber of Commerce Seal Area
  doc.setDrawColor(100, 100, 100);
  doc.rect(120, finalY + 35, 60, 40);
  doc.setFontSize(8);
  doc.text('Chamber of Commerce', 125, finalY + 50, { align: 'left' });
  doc.text('Seal & Signature', 125, finalY + 56, { align: 'left' });

  doc.save(`certificate-of-origin-${shipment.shipment_id}.pdf`);
};

// Material Safety Data Sheet (MSDS)
export const generateMSDS = (order, inquiry) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('MATERIAL SAFETY DATA SHEET (MSDS)', 105, 20, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`MSDS Number: MSDS-${order.order_number}`, 105, 30, { align: 'center' });
  doc.text(`Issue Date: ${new Date().toLocaleDateString()}`, 105, 36, { align: 'center' });

  // Section 1: Product Identification
  doc.setFont(undefined, 'bold');
  doc.text('1. PRODUCT IDENTIFICATION', 20, 50);
  doc.setFont(undefined, 'normal');
  doc.text(`Product Name: ${order.product || 'Chemical Product'}`, 25, 58);
  doc.text(`Application: ${inquiry?.application || 'Industrial Chemical'}`, 25, 64);
  doc.text('Supplier: Ashoka Technovations', 25, 70);
  doc.text('Emergency Contact: +91-XXX-XXXXXXX', 25, 76);

  // Section 2: Hazard Identification
  doc.setFont(undefined, 'bold');
  doc.text('2. HAZARD IDENTIFICATION', 20, 90);
  doc.setFont(undefined, 'normal');
  doc.text('Classification: Chemical Substance', 25, 98);
  doc.text('Signal Word: Warning/Danger', 25, 104);
  doc.text('Hazard Statements: May cause skin/eye irritation', 25, 110);
  doc.text('Precautionary Statements: Wear protective equipment', 25, 116);

  // Section 3: Composition
  doc.setFont(undefined, 'bold');
  doc.text('3. COMPOSITION/INFORMATION ON INGREDIENTS', 20, 130);
  doc.setFont(undefined, 'normal');
  doc.text('Chemical Name: [As per product]', 25, 138);
  doc.text('CAS Number: [CAS Registry Number]', 25, 144);
  doc.text('Concentration: [Percentage]', 25, 150);

  // Section 4: First Aid
  doc.setFont(undefined, 'bold');
  doc.text('4. FIRST AID MEASURES', 20, 164);
  doc.setFont(undefined, 'normal');
  doc.text('Eye Contact: Rinse with water for 15 minutes', 25, 172);
  doc.text('Skin Contact: Wash with soap and water', 25, 178);
  doc.text('Inhalation: Move to fresh air', 25, 184);
  doc.text('Ingestion: Do not induce vomiting. Seek medical attention', 25, 190);

  // Section 5: Fire Fighting
  doc.setFont(undefined, 'bold');
  doc.text('5. FIRE FIGHTING MEASURES', 20, 204);
  doc.setFont(undefined, 'normal');
  doc.text('Suitable Extinguishing Media: CO2, Dry chemical, Foam', 25, 212);
  doc.text('Special Protective Equipment: Self-contained breathing apparatus', 25, 218);

  // Section 6: Storage & Handling
  doc.setFont(undefined, 'bold');
  doc.text('6. STORAGE AND HANDLING', 20, 232);
  doc.setFont(undefined, 'normal');
  doc.text('Storage: Store in cool, dry, well-ventilated area', 25, 240);
  doc.text('Handling: Use appropriate personal protective equipment', 25, 246);

  // Footer
  doc.setFontSize(8);
  doc.text('This MSDS is prepared in accordance with international standards', 105, 270, { align: 'center' });
  doc.text('For complete information, refer to the full MSDS document', 105, 276, { align: 'center' });

  doc.save(`msds-${order.order_number}.pdf`);
};

// Bank Realization Certificate (BRC) for RBI
export const generateBRC = (payment, order, shipment) => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('BANK REALIZATION CERTIFICATE', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('(For Reserve Bank of India)', 105, 28, { align: 'center' });

  // Certificate Details
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('BRC Number:', 20, 45);
  doc.setFont(undefined, 'normal');
  doc.text(`BRC-${payment.invoice_number}`, 60, 45);

  doc.setFont(undefined, 'bold');
  doc.text('Date:', 140, 45);
  doc.setFont(undefined, 'normal');
  doc.text(new Date(payment.payment_date).toLocaleDateString(), 160, 45);

  // Bank Details
  doc.setFont(undefined, 'bold');
  doc.text('BANK DETAILS:', 20, 65);
  doc.setFont(undefined, 'normal');
  doc.text('Bank Name: [Authorized Dealer Bank]', 20, 72);
  doc.text('Branch: [Branch Name]', 20, 78);
  doc.text('AD Code: [AD Code Number]', 20, 84);

  // Exporter Details
  doc.setFont(undefined, 'bold');
  doc.text('EXPORTER DETAILS:', 20, 100);
  doc.setFont(undefined, 'normal');
  doc.text('Name: Ashoka Technovations', 20, 107);
  doc.text('IEC Code: AAACX1234E', 20, 113);
  doc.text('PAN: AAACX1234E', 20, 119);

  // Shipment & Payment Details
  const detailsData = [[
    order.order_number || 'N/A',
    shipment.shipment_id || 'N/A',
    shipment.bl_number || 'N/A',
    new Date(shipment.created_at).toLocaleDateString(),
    order.product || 'N/A',
    `${order.quantity || 0} KG`,
    `${payment.currency} ${payment.amount.toLocaleString()}`
  ]];

  doc.autoTable({
    startY: 130,
    head: [['Invoice No', 'Shipment ID', 'B/L Number', 'Shipment Date', 'Description', 'Quantity', 'Invoice Value']],
    body: detailsData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 8 },
    bodyStyles: { fontSize: 9 },
  });

  // Realization Details
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFont(undefined, 'bold');
  doc.text('REALIZATION DETAILS:', 20, finalY);
  doc.setFont(undefined, 'normal');
  doc.text(`Amount Realized: ${payment.currency} ${payment.amount.toLocaleString()}`, 20, finalY + 7);
  doc.text(`Date of Realization: ${new Date(payment.payment_date).toLocaleDateString()}`, 20, finalY + 13);
  doc.text(`Bank Reference: ${payment.bank_reference || 'N/A'}`, 20, finalY + 19);
  doc.text(`FIRC Number: ${payment.firc_number || 'Pending'}`, 20, finalY + 25);
  doc.text('Mode of Payment: SWIFT Transfer', 20, finalY + 31);

  // Certification
  doc.setFont(undefined, 'bold');
  doc.text('BANK CERTIFICATION:', 20, finalY + 48);
  doc.setFont(undefined, 'normal');
  doc.setFontSize(9);
  const certText = doc.splitTextToSize(
    'This is to certify that the above mentioned foreign exchange has been realized and credited to ' +
    'the account of the exporter in full as per RBI guidelines. This certificate is issued for submission ' +
    'to Reserve Bank of India and other regulatory authorities.',
    170
  );
  doc.text(certText, 20, finalY + 55);

  // Signature
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('For [Authorized Dealer Bank]', 20, finalY + 85);
  doc.text('_____________________', 20, finalY + 100);
  doc.text('Authorized Signatory', 20, finalY + 107);
  doc.text('Bank Seal', 130, finalY + 100);

  doc.save(`brc-${payment.invoice_number}.pdf`);
};

// FIRC Summary Report for RBI Compliance
export const generateFIRCSummary = (payments, startDate, endDate) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('FOREIGN INWARD REMITTANCE CERTIFICATE', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.text('Summary Report for RBI Compliance', 105, 28, { align: 'center' });

  // Report Period
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Report Period: ${startDate} to ${endDate}`, 105, 38, { align: 'center' });
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 44, { align: 'center' });

  // Company Details
  doc.setFont(undefined, 'bold');
  doc.text('COMPANY DETAILS:', 20, 58);
  doc.setFont(undefined, 'normal');
  doc.text('Ashoka Technovations', 20, 65);
  doc.text('IEC Code: AAACX1234E', 20, 71);
  doc.text('PAN: AAACX1234E', 20, 77);

  // Summary Statistics
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const avgAmount = totalAmount / payments.length;

  doc.setFont(undefined, 'bold');
  doc.text('SUMMARY:', 20, 92);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Transactions: ${payments.length}`, 20, 99);
  doc.text(`Total Amount Received: ${payments[0]?.currency || 'USD'} ${totalAmount.toLocaleString()}`, 20, 105);
  doc.text(`Average Transaction: ${payments[0]?.currency || 'USD'} ${avgAmount.toLocaleString()}`, 20, 111);

  // Detailed Transactions
  const transactionData = payments.map((payment, index) => [
    index + 1,
    payment.invoice_number,
    payment.customer,
    new Date(payment.payment_date).toLocaleDateString(),
    `${payment.currency} ${payment.amount.toLocaleString()}`,
    payment.firc_number || 'Pending',
    payment.bank_reference || 'N/A'
  ]);

  doc.autoTable({
    startY: 125,
    head: [['S.No', 'Invoice', 'Customer', 'Date', 'Amount', 'FIRC Number', 'Bank Ref']],
    body: transactionData,
    theme: 'grid',
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontSize: 9 },
    bodyStyles: { fontSize: 8 },
  });

  // Footer
  const finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(9);
  doc.setFont(undefined, 'bold');
  doc.text('Declaration:', 20, finalY);
  doc.setFont(undefined, 'normal');
  doc.text('All foreign exchange receipts have been duly reported and comply with FEMA regulations.', 20, finalY + 7);

  doc.setFont(undefined, 'bold');
  doc.text('Authorized Signatory', 20, finalY + 30);
  doc.text('_____________________', 20, finalY + 35);

  doc.save(`firc-summary-${new Date().getTime()}.pdf`);
};