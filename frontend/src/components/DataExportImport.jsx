import React, { useRef } from 'react';
import { Button } from './ui/button';
import { FileDown, FileUp, FileSpreadsheet, FileText } from 'lucide-react';
import { exportToExcel, exportToCSV, exportToPDF, importFromExcel, prepareDataForExport } from '../utils/exportUtils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const DataExportImport = ({ data, filename, title, columns, onImport, showImport = true }) => {
  const fileInputRef = useRef(null);

  const handleExport = (format) => {
    if (!data || data.length === 0) {
      toast.error('No data to export');
      return;
    }

    const cleanedData = prepareDataForExport(data);

    try {
      switch (format) {
        case 'excel':
          exportToExcel(cleanedData, filename);
          toast.success('Exported to Excel successfully');
          break;
        case 'csv':
          exportToCSV(cleanedData, filename);
          toast.success('Exported to CSV successfully');
          break;
        case 'pdf':
          exportToPDF(cleanedData, filename, title, columns);
          toast.success('Exported to PDF successfully');
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to export data');
      console.error(error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(fileExtension)) {
      toast.error('Please upload an Excel (.xlsx, .xls) or CSV file');
      return;
    }

    importFromExcel(file, (importedData, error) => {
      if (error) {
        toast.error('Failed to import file');
        console.error(error);
        return;
      }

      if (importedData && importedData.length > 0) {
        onImport(importedData);
        toast.success(`Successfully imported ${importedData.length} records`);
      } else {
        toast.error('No data found in file');
      }
    });

    // Reset input
    e.target.value = '';
  };

  return (
    <div className="flex gap-2">
      {showImport && onImport && (
        <>
          <Button
            variant="outline"
            onClick={handleImportClick}
            data-testid="import-button"
            className="border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <FileUp className="w-4 h-4 mr-2" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            data-testid="export-button"
            className="border-teal-600 text-teal-600 hover:bg-teal-50"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => handleExport('excel')}
            data-testid="export-excel"
            className="cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
            Export as Excel
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport('csv')}
            data-testid="export-csv"
            className="cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleExport('pdf')}
            data-testid="export-pdf"
            className="cursor-pointer"
          >
            <FileText className="w-4 h-4 mr-2 text-red-600" />
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default DataExportImport;