import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const Samples = () => {
  const location = useLocation();
  const [samples, setSamples] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    inquiry_id: '',
    supplier_name: '',
    product_name: '',
    testing_required: true,
  });

  useEffect(() => {
    fetchData();
  }, [location.key]);

  const fetchData = async () => {
    try {
      const [samplesRes, inquiriesRes] = await Promise.all([
        api.get('/samples'),
        api.get('/inquiries'),
      ]);
      setSamples(samplesRes.data);
      setInquiries(inquiriesRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/samples', formData);
      toast.success('Sample recorded successfully');
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error('Failed to create sample');
    }
  };

  const assignTechnician = async (sampleId, technicianName) => {
    try {
      await api.put(`/samples/${sampleId}/assign?technician_name=${technicianName}`);
      toast.success('Technician assigned');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign technician');
    }
  };

  const resetForm = () => {
    setFormData({
      inquiry_id: '',
      supplier_name: '',
      product_name: '',
      testing_required: true,
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Tested': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Sample Management
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Track laboratory sample inward and testing assignments
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-sample-button" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Record Sample
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Sample</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="sample-form">
              <div>
                <Label htmlFor="inquiry_id">Linked Inquiry</Label>
                <select
                  id="inquiry_id"
                  data-testid="inquiry-select"
                  value={formData.inquiry_id}
                  onChange={(e) => setFormData({ ...formData, inquiry_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select an inquiry</option>
                  {inquiries.map((inquiry) => (
                    <option key={inquiry.id} value={inquiry.id}>
                      {inquiry.customer_name} - {inquiry.product_requested}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="supplier_name">Supplier Name</Label>
                <Input
                  id="supplier_name"
                  data-testid="supplier-input"
                  value={formData.supplier_name}
                  onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="product_name">Product Name</Label>
                <Input
                  id="product_name"
                  data-testid="product-input"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="testing_required"
                  data-testid="testing-required-checkbox"
                  checked={formData.testing_required}
                  onChange={(e) => setFormData({ ...formData, testing_required: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="testing_required" className="cursor-pointer">Testing Required</Label>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-sample-button" className="bg-slate-700 hover:bg-slate-800">
                  Record Sample
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="samples-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-16">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Technician</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {samples.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No samples found. Record your first sample to get started.
                  </td>
                </tr>
              ) : (
                samples.map((sample, idx) => (
                  <tr key={sample.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="sample-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{idx + 1}.</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sample.supplier_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{sample.product_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {sample.assigned_technician || (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(sample.status)}`}>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!sample.assigned_technician && (
                        <Input
                          data-testid="assign-technician-input"
                          placeholder="Assign technician"
                          className="w-40 text-sm"
                          onBlur={(e) => {
                            if (e.target.value) {
                              assignTechnician(sample.id, e.target.value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && e.target.value) {
                              assignTechnician(sample.id, e.target.value);
                            }
                          }}
                        />
                      )}
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

export default Samples;