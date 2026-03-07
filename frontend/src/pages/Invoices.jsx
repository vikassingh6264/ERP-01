import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, Send, Eye, Download, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { downloadInvoice, previewInvoice } from '../utils/invoiceGenerator';
import { DataExportImport } from '../components/DataExportImport';

export const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sales_order_id: '',
    customer_name: '',
    customer_email: '',
    billing_address: '',
    product: '',
    quantity: 0,
    unit_price: 0,
    currency: 'USD',
    tax_percentage: 0,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoicesRes, ordersRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/sales-orders'),
      ]);
      setInvoices(invoicesRes.data);
      setSalesOrders(ordersRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOrderChange = (orderId) => {
    const selectedOrder = salesOrders.find(o => o.id === orderId);
    if (selectedOrder) {
      setFormData({
        ...formData,
        sales_order_id: orderId,
        customer_name: selectedOrder.customer_name,
        product: selectedOrder.product,
        quantity: selectedOrder.quantity,
        unit_price: selectedOrder.total_amount / selectedOrder.quantity,
        currency: selectedOrder.currency,
        billing_address: selectedOrder.billing_address || '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', formData);
      toast.success('Invoice created successfully');
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const handleSendEmail = async (invoiceId) => {
    try {
      const response = await api.put(`/invoices/${invoiceId}/send`);
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error('Failed to send invoice');
    }
  };

  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await api.put(`/invoices/${invoiceId}/status?status=${newStatus}`);
      toast.success('Status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDownload = (invoice) => {
    downloadInvoice(invoice);
    toast.success('Invoice downloaded');
  };

  const handlePreview = (invoice) => {
    previewInvoice(invoice);
  };

  const resetForm = () => {
    setFormData({
      sales_order_id: '',
      customer_name: '',
      customer_email: '',
      billing_address: '',
      product: '',
      quantity: 0,
      unit_price: 0,
      currency: 'USD',
      tax_percentage: 0,
      notes: '',
    });
  };

  const handleImport = async (importedData) => {
    try {
      let successCount = 0;
      for (const row of importedData) {
        const invoiceData = {
          sales_order_id: row['Sales Order ID'] || row.sales_order_id || '',
          customer_name: row['Customer Name'] || row.customer_name || '',
          customer_email: row['Customer Email'] || row.customer_email || '',
          billing_address: row['Billing Address'] || row.billing_address || '',
          product: row['Product'] || row.product || '',
          quantity: parseFloat(row['Quantity'] || row.quantity || 0),
          unit_price: parseFloat(row['Unit Price'] || row.unit_price || 0),
          currency: row['Currency'] || row.currency || 'USD',
          tax_percentage: parseFloat(row['Tax %'] || row.tax_percentage || 0),
          notes: row['Notes'] || row.notes || '',
        };

        if (invoiceData.customer_name && invoiceData.customer_email) {
          await api.post('/invoices', invoiceData);
          successCount++;
        }
      }

      fetchData();
      toast.success(`Successfully imported ${successCount} invoices`);
    } catch (error) {
      toast.error('Some records failed to import');
    }
  };

  const exportColumns = [
    { key: 'invoice_number', label: 'Invoice Number' },
    { key: 'customer_name', label: 'Customer Name' },
    { key: 'customer_email', label: 'Customer Email' },
    { key: 'product', label: 'Product' },
    { key: 'quantity', label: 'Quantity' },
    { key: 'currency', label: 'Currency' },
    { key: 'total_amount', label: 'Total Amount' },
    { key: 'status', label: 'Status' },
    { key: 'invoice_date', label: 'Invoice Date' },
    { key: 'due_date', label: 'Due Date' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Paid': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const isOverdue = (invoice) => {
    if (invoice.status === 'Paid') return false;
    const dueDate = new Date(invoice.due_date);
    return dueDate < new Date();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Invoices
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Generate and manage customer invoices
          </p>
        </div>
        <div className="flex gap-3">
          <DataExportImport
            data={invoices}
            filename="invoices"
            title="Invoices"
            columns={exportColumns}
            onImport={handleImport}
          />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="create-invoice-button" className="bg-slate-900 hover:bg-slate-800">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="invoice-form">
                <div>
                  <Label htmlFor="sales_order_id">From Sales Order (Optional)</Label>
                  <select
                    id="sales_order_id"
                    data-testid="order-select"
                    value={formData.sales_order_id}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select a sales order or create manually</option>
                    {salesOrders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.order_number} - {order.customer_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer_name">Customer Name *</Label>
                    <Input
                      id="customer_name"
                      data-testid="customer-name-input"
                      value={formData.customer_name}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_email">Customer Email *</Label>
                    <Input
                      id="customer_email"
                      data-testid="customer-email-input"
                      type="email"
                      value={formData.customer_email}
                      onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="billing_address">Billing Address *</Label>
                  <textarea
                    id="billing_address"
                    data-testid="billing-address-input"
                    value={formData.billing_address}
                    onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 min-h-20"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product">Product/Service Description *</Label>
                  <Input
                    id="product"
                    data-testid="product-input"
                    value={formData.product}
                    onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
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
                    <Label htmlFor="unit_price">Unit Price *</Label>
                    <Input
                      id="unit_price"
                      data-testid="unit-price-input"
                      type="number"
                      step="0.01"
                      value={formData.unit_price}
                      onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
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
                  <div>
                    <Label htmlFor="tax_percentage">Tax %</Label>
                    <Input
                      id="tax_percentage"
                      data-testid="tax-input"
                      type="number"
                      step="0.01"
                      value={formData.tax_percentage}
                      onChange={(e) => setFormData({ ...formData, tax_percentage: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <textarea
                    id="notes"
                    data-testid="notes-input"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 min-h-16"
                    placeholder="Payment terms, special instructions, etc."
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      {formData.currency} {(formData.quantity * formData.unit_price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Tax ({formData.tax_percentage}%):</span>
                    <span className="font-semibold">
                      {formData.currency} {((formData.quantity * formData.unit_price) * (formData.tax_percentage / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-slate-300">
                    <span>Total:</span>
                    <span>
                      {formData.currency} {((formData.quantity * formData.unit_price) * (1 + formData.tax_percentage / 100)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" data-testid="submit-invoice-button" className="bg-teal-600 hover:bg-teal-700">
                    Create Invoice
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="invoices-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-16">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Due Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-slate-500">
                    No invoices found. Create your first invoice to get started.
                  </td>
                </tr>
              ) : (
                invoices.map((invoice, idx) => (
                  <tr key={invoice.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="invoice-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{idx + 1}.</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <div>{invoice.customer_name}</div>
                      <div className="text-xs text-slate-400">{invoice.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{invoice.product}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums font-semibold">
                      {invoice.currency} {invoice.total_amount?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : <span className="text-slate-400 italic">N/A</span>}
                      {invoice.due_date && isOverdue(invoice) && invoice.status !== 'Paid' && (
                        <span className="ml-2 text-xs text-red-600 font-semibold">OVERDUE</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        data-testid="status-select"
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
                        className={`text-xs rounded-full border px-2.5 py-1 font-semibold ${getStatusColor(invoice.status)}`}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="preview-invoice-button"
                          onClick={() => handlePreview(invoice)}
                          className="border-slate-300 text-slate-700 hover:bg-slate-50"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="download-invoice-button"
                          onClick={() => handleDownload(invoice)}
                          className="border-teal-600 text-teal-600 hover:bg-teal-50"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="send-email-button"
                          onClick={() => handleSendEmail(invoice.id)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          title="Send via Email"
                          disabled={invoice.status === 'Paid'}
                        >
                          <Mail className="w-4 h-4" />
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
    </div>
  );
};

export default Invoices;