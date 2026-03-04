import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Export to Excel
export const exportToExcel = (data, filename, sheetName = 'Sheet1') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
};

// Export to CSV
export const exportToCSV = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

// Export to PDF
export const exportToPDF = (data, filename, title, columns) => {
  const doc = new jsPDF('landscape'); // Landscape for more columns
  
  // Title
  doc.setFontSize(18);\n  doc.setFont(undefined, 'bold');
  doc.text(title, 14, 20);
  
  // Date
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  
  // Prepare table data - handle all data types properly
  const tableData = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') return value.toLocaleString();
      if (typeof value === 'string' && value.match(/^\\d{4}-\\d{2}-\\d{2}T/)) {
        return new Date(value).toLocaleString();
      }
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value);
    });
  });
  
  // Generate table with better styling
  doc.autoTable({
    startY: 35,
    head: [columns.map(col => col.label)],
    body: tableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [15, 23, 42], 
      textColor: 255, 
      fontSize: 9, 
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 8 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
    styles: {
      overflow: 'linebreak',
      cellPadding: 3,
    },
    columnStyles: {
      // Adjust column widths based on content
      ...columns.reduce((acc, col, index) => {
        acc[index] = { cellWidth: 'auto' };
        return acc;
      }, {})
    }
  });
  
  // Footer with page numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount} | ${title}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`${filename}.pdf`);
};

// Import from Excel
export const importFromExcel = (file, callback) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      callback(jsonData, null);
    } catch (error) {
      callback(null, error);
    }
  };
  
  reader.onerror = (error) => {
    callback(null, error);
  };
  
  reader.readAsArrayBuffer(file);
};

// Prepare data for export (clean up MongoDB fields)
export const prepareDataForExport = (data) => {
  return data.map(item => {
    const cleaned = { ...item };
    // Remove MongoDB _id and other internal fields
    delete cleaned._id;
    delete cleaned.id;
    // Format dates
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] && typeof cleaned[key] === 'string' && cleaned[key].match(/^\d{4}-\d{2}-\d{2}T/)) {
        cleaned[key] = new Date(cleaned[key]).toLocaleString();
      }
    });
    return cleaned;
  });
};