import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Edit, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { DataExportImport } from '../components/DataExportImport';

export const Inquiries = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [activities, setActivities] = useState([]);
  const [currentStage, setCurrentStage] = useState('');
  const [formData, setFormData] = useState({
    customer_name: '',
    company_name: '',
    email: '',
    country: '',
    product_requested: '',
    application: '',
    sample_required: false,
  });

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await api.get('/inquiries');
      setInquiries(response.data);
    } catch (error) {
      toast.error('Failed to fetch inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/inquiries', formData);
      toast.success('Inquiry created successfully');
      setIsDialogOpen(false);
      fetchInquiries();
      resetForm();
    } catch (error) {
      toast.error('Failed to create inquiry');
    }
  };

  const updateStatus = async (inquiryId, newStatus) => {
    try {
      await api.put(`/inquiries/${inquiryId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchInquiries();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: '',
      company_name: '',
      email: '',
      country: '',
      product_requested: '',
      application: '',
      sample_required: false,
    });
  };

  const viewActivities = async (customerEmail, customerName) => {
    try {
      const response = await api.get(`/activities/customer/${customerEmail}`);
      setActivities(response.data.activities);
      setCurrentStage(response.data.current_stage);
      setSelectedCustomer(customerName);
      setIsActivityDialogOpen(true);
    } catch (error) {
      toast.error('Failed to fetch activities');
    }
  };

  const handleImport = async (importedData) => {
    try {
      let successCount = 0;
      for (const row of importedData) {
        // Map Excel columns to API fields
        const inquiryData = {
          customer_name: row['Customer Name'] || row.customer_name || '',
          company_name: row['Company Name'] || row.company_name || '',
          email: row['Email'] || row.email || '',
          country: row['Country'] || row.country || '',
          product_requested: row['Product Requested'] || row.product_requested || '',
          application: row['Application'] || row.application || '',
          sample_required: row['Sample Required'] === 'Yes' || row.sample_required === true,
        };

        if (inquiryData.customer_name && inquiryData.email) {
          await api.post('/inquiries', inquiryData);
          successCount++;
        }
      }
      
      fetchInquiries();
      toast.success(`Successfully imported ${successCount} inquiries`);
    } catch (error) {
      toast.error('Some records failed to import');
    }
  };

  const exportColumns = [
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'company_name', label: 'Company Name' },
    { key: 'email', label: 'Email' },
    { key: 'country', label: 'Country' },
    { key: 'product_requested', label: 'Product Requested' },
    { key: 'application', label: 'Application' },
    { key: 'sample_required', label: 'Sample Required' },
    { key: 'status', label: 'Status' },
    { key: 'created_at', label: 'Created Date' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Quoted': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Closed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
            Customer Inquiries
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage customer product inquiries and requests
          </p>
        </div>
        <div className="flex gap-3">
          <DataExportImport
            data={inquiries}
            filename="customer-inquiries"
            title="Customer Inquiries"
            columns={exportColumns}
            onImport={handleImport}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-inquiry-button" className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                New Inquiry
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Inquiry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="inquiry-form">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Customer Name</Label>
                  <Input
                    id="customer_name"
                    data-testid="customer-name-input"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    data-testid="company-name-input"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    data-testid="email-input"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    data-testid="country-input"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="product_requested">Product Requested</Label>
                <Input
                  id="product_requested"
                  data-testid="product-input"
                  value={formData.product_requested}
                  onChange={(e) => setFormData({ ...formData, product_requested: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="application">Application</Label>
                <textarea
                  id="application"
                  data-testid="application-input"
                  value={formData.application}
                  onChange={(e) => setFormData({ ...formData, application: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2 min-h-24"
                  required
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="sample_required"
                  data-testid="sample-required-checkbox"
                  checked={formData.sample_required}
                  onChange={(e) => setFormData({ ...formData, sample_required: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="sample_required" className="cursor-pointer">Sample Required</Label>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-inquiry-button" className="bg-teal-600 hover:bg-teal-700">
                  Create Inquiry
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="inquiries-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Company</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Country</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Sample</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No inquiries found. Create your first inquiry to get started.
                  </td>
                </tr>
              ) : (
                inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="inquiry-row">
                    <td className="px-6 py-4 text-sm text-slate-900">{inquiry.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{inquiry.company_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{inquiry.product_requested}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{inquiry.country}</td>
                    <td className="px-6 py-4 text-sm">
                      {inquiry.sample_required ? (
                        <span className="text-emerald-600 font-medium">Yes</span>
                      ) : (
                        <span className="text-slate-400">No</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <select
                          data-testid="status-select"
                          value={inquiry.status}
                          onChange={(e) => updateStatus(inquiry.id, e.target.value)}
                          className="text-sm border border-slate-300 rounded px-2 py-1"
                        >
                          <option value="New">New</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Closed">Closed</option>
                        </select>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="view-activities-button"
                          onClick={() => viewActivities(inquiry.email, inquiry.customer_name)}
                          className="border-teal-600 text-teal-600 hover:bg-teal-50"
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Activity Timeline Dialog */}
      <Dialog open={isActivityDialogOpen} onOpenChange={setIsActivityDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Activities - {selectedCustomer}</DialogTitle>
          </DialogHeader>
          <ActivityTimeline activities={activities} currentStage={currentStage} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Inquiries;