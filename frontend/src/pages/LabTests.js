import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Trash2, FileDown } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const LabTests = () => {
  const [tests, setTests] = useState([]);
  const [samples, setSamples] = useState([]);
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sample_id: '',
    test_method: '',
    test_result: '',
    remarks: '',
    technician_name: '',
    chemicals_used: [{ chemical_name: '', quantity: 0, unit: 'ml' }],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [testsRes, samplesRes, chemicalsRes] = await Promise.all([
        api.get('/lab-tests'),
        api.get('/samples'),
        api.get('/chemicals'),
      ]);
      setTests(testsRes.data);
      setSamples(samplesRes.data);
      setChemicals(chemicalsRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lab-tests', formData);
      toast.success('Lab test recorded successfully');
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create lab test');
    }
  };

  const addChemical = () => {
    setFormData({
      ...formData,
      chemicals_used: [...formData.chemicals_used, { chemical_name: '', quantity: 0, unit: 'ml' }],
    });
  };

  const removeChemical = (index) => {
    const updated = formData.chemicals_used.filter((_, i) => i !== index);
    setFormData({ ...formData, chemicals_used: updated });
  };

  const updateChemical = (index, field, value) => {
    const updated = [...formData.chemicals_used];
    updated[index][field] = value;
    setFormData({ ...formData, chemicals_used: updated });
  };

  const generatePDF = (test) => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Laboratory Test Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Sample ID: ${test.sample_id}`, 20, 40);
    doc.text(`Test Method: ${test.test_method}`, 20, 50);
    doc.text(`Technician: ${test.technician_name}`, 20, 60);
    doc.text(`Test Date: ${new Date(test.test_date).toLocaleDateString()}`, 20, 70);
    
    doc.text('Test Result:', 20, 85);
    doc.setFontSize(10);
    const resultLines = doc.splitTextToSize(test.test_result, 170);
    doc.text(resultLines, 20, 92);
    
    if (test.chemicals_used && test.chemicals_used.length > 0) {
      doc.setFontSize(12);
      doc.text('Chemicals Used:', 20, 120);
      
      const tableData = test.chemicals_used.map(chem => [
        chem.chemical_name,
        `${chem.quantity} ${chem.unit}`
      ]);
      
      doc.autoTable({
        startY: 125,
        head: [['Chemical Name', 'Quantity']],
        body: tableData,
      });
    }
    
    if (test.remarks) {
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 160;
      doc.setFontSize(12);
      doc.text('Remarks:', 20, finalY);
      doc.setFontSize(10);
      const remarksLines = doc.splitTextToSize(test.remarks, 170);
      doc.text(remarksLines, 20, finalY + 7);
    }
    
    doc.save(`test-report-${test.sample_id}.pdf`);
    toast.success('PDF downloaded successfully');
  };

  const resetForm = () => {
    setFormData({
      sample_id: '',
      test_method: '',
      test_result: '',
      remarks: '',
      technician_name: '',
      chemicals_used: [{ chemical_name: '', quantity: 0, unit: 'ml' }],
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Lab Testing
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Record and manage laboratory testing activities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-test-button" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Record Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record Lab Test</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="test-form">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sample_id">Sample ID</Label>
                  <select
                    id="sample_id"
                    data-testid="sample-select"
                    value={formData.sample_id}
                    onChange={(e) => setFormData({ ...formData, sample_id: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select sample</option>
                    {samples.map((sample) => (
                      <option key={sample.id} value={sample.sample_id}>
                        {sample.sample_id} - {sample.product_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="test_method">Test Method</Label>
                  <Input
                    id="test_method"
                    data-testid="test-method-input"
                    value={formData.test_method}
                    onChange={(e) => setFormData({ ...formData, test_method: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="technician_name">Technician Name</Label>
                <Input
                  id="technician_name"
                  data-testid="technician-input"
                  value={formData.technician_name}
                  onChange={(e) => setFormData({ ...formData, technician_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="test_result">Test Result</Label>
                <textarea
                  id="test_result"
                  data-testid="test-result-input"
                  value={formData.test_result}
                  onChange={(e) => setFormData({ ...formData, test_result: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 min-h-24"
                  required
                />
              </div>
              <div>
                <Label htmlFor="remarks">Remarks (Optional)</Label>
                <textarea
                  id="remarks"
                  data-testid="remarks-input"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 min-h-16"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Chemicals Used</Label>
                  <Button type="button" size="sm" onClick={addChemical} data-testid="add-chemical-button">
                    <Plus className="w-4 h-4 mr-1" /> Add Chemical
                  </Button>
                </div>
                {formData.chemicals_used.map((chem, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-5">
                      <select
                        data-testid={`chemical-select-${index}`}
                        value={chem.chemical_name}
                        onChange={(e) => updateChemical(index, 'chemical_name', e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                        required
                      >
                        <option value="">Select chemical</option>
                        {chemicals.map((chemical) => (
                          <option key={chemical.id} value={chemical.chemical_name}>
                            {chemical.chemical_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        data-testid={`quantity-input-${index}`}
                        type="number"
                        step="0.01"
                        value={chem.quantity}
                        onChange={(e) => updateChemical(index, 'quantity', parseFloat(e.target.value))}
                        placeholder="Quantity"
                        required
                      />
                    </div>
                    <div className="col-span-3">
                      <select
                        data-testid={`unit-select-${index}`}
                        value={chem.unit}
                        onChange={(e) => updateChemical(index, 'unit', e.target.value)}
                        className="w-full border border-slate-300 rounded-md px-2 py-1 text-sm"
                      >
                        <option value="ml">ml</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="L">L</option>
                      </select>
                    </div>
                    <div className="col-span-1 flex items-center">
                      {formData.chemicals_used.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChemical(index)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`remove-chemical-${index}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-test-button" className="bg-teal-600 hover:bg-teal-700">
                  Record Test
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="tests-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sample ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Test Method</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Technician</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Test Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Result</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No tests found. Record your first test to get started.
                  </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="test-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{test.sample_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{test.test_method}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{test.technician_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {new Date(test.test_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div className="max-w-xs truncate">{test.test_result}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Button
                        size="sm"
                        variant="outline"
                        data-testid="download-pdf-button"
                        onClick={() => generatePDF(test)}
                        className="border-teal-600 text-teal-600 hover:bg-teal-50"
                      >
                        <FileDown className="w-4 h-4 mr-1" />
                        PDF
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default LabTests;