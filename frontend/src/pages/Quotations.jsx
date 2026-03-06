import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const Quotations = () => {
  const [quotations, setQuotations] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    inquiry_id: '',
    customer_name: '',
    product: '',
    price_per_kg: 0,
    quantity: 0,
    currency: 'USD',
    export_terms: 'FOB',
    validity_days: 30,
    status: 'Sent',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [quotationsRes, inquiriesRes] = await Promise.all([
        api.get('/quotations'),
        api.get('/inquiries'),
      ]);
      setQuotations(quotationsRes.data);
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
      await api.post('/quotations', formData);
      toast.success('Quotation created successfully');
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error('Failed to create quotation');
    }
  };

  const resetForm = () => {
    setFormData({
      inquiry_id: '',
      customer_name: '',
      product: '',
      price_per_kg: 0,
      quantity: 0,
      currency: 'USD',
      export_terms: 'FOB',
      validity_days: 30,
      status: 'Sent',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Accepted': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
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
            Quotations
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Create and manage price quotations for customers
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-quotation-button" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              New Quotation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Quotation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="quotation-form">
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
                  <Label htmlFor="product">Product</Label>
                  <Input
                    id="product"
                    data-testid="product-input"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price_per_kg">Price per KG</Label>
                  <Input
                    id="price_per_kg"
                    data-testid="price-input"
                    type="number"
                    step="0.01"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({ ...formData, price_per_kg: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity (KG)</Label>
                  <Input
                    id="quantity"
                    data-testid="quantity-input"
                    type="number"
                    step="0.01"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    data-testid="currency-select"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="export_terms">Export Terms</Label>
                  <select
                    id="export_terms"
                    data-testid="export-terms-select"
                    value={formData.export_terms}
                    onChange={(e) => setFormData({ ...formData, export_terms: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  >
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="EXW">EXW</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="validity_days">Validity (Days)</Label>
                  <Input
                    id="validity_days"
                    data-testid="validity-input"
                    type="number"
                    value={formData.validity_days}
                    onChange={(e) => setFormData({ ...formData, validity_days: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-quotation-button" className="bg-teal-600 hover:bg-teal-700">
                  Create Quotation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="quotations-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-16">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Quote #</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Terms</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {quotations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No quotations found. Create your first quotation to get started.
                  </td>
                </tr>
              ) : (
                quotations.map((quote, idx) => (
                  <tr key={quote.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="quotation-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{idx + 1}.</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 text-slate-600">{quote.quotation_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{quote.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{quote.product}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                      {quote.currency} {quote.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{quote.export_terms}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(quote.status)}`}>
                        {quote.status}
                      </span>
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

export default Quotations;