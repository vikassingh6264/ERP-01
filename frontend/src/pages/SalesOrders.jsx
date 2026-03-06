import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const SalesOrders = () => {
  const [orders, setOrders] = useState([]);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    quotation_id: '',
    customer_name: '',
    product: '',
    quantity: 0,
    total_amount: 0,
    currency: 'USD',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, quotationsRes] = await Promise.all([
        api.get('/sales-orders'),
        api.get('/quotations'),
      ]);
      setOrders(ordersRes.data);
      setQuotations(quotationsRes.data.filter(q => !q.status || q.status === 'Sent' || q.status === 'Accepted'));
    } catch (error) {
      console.error('Failed to fetch data, using mock data:', error);
      // Fallback for frontend-only testing
      setOrders([
        { id: '1', order_number: 'SO00001', customer_name: 'Alpha Corp', product: 'Reactive Blue 19', quantity: 250, total_amount: 1250, currency: 'USD', status: 'Confirmed' },
        { id: '2', order_number: 'SO00002', customer_name: 'Beta Indus', product: 'Solvent Red 24', quantity: 500, total_amount: 3000, currency: 'EUR', status: 'Processing' }
      ]);
      setQuotations([
        { id: 'q1', quotation_number: 'QUO00001', customer_name: 'Alpha Corp', product: 'Reactive Blue 19', quantity: 250, total_amount: 1250, currency: 'USD', status: 'Sent' },
        { id: 'q2', quotation_number: 'QUO00002', customer_name: 'Beta Indus', product: 'Solvent Red 24', quantity: 500, total_amount: 3000, currency: 'EUR', status: 'Sent' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuotationChange = (quotationId) => {
    const selectedQuote = quotations.find(q => q.id === quotationId);
    if (selectedQuote) {
      setFormData({
        ...formData,
        quotation_id: quotationId,
        customer_name: selectedQuote.customer_name,
        product: selectedQuote.product,
        quantity: selectedQuote.quantity,
        total_amount: selectedQuote.total_amount,
        currency: selectedQuote.currency,
      });
    } else {
      setFormData({
        ...formData,
        quotation_id: quotationId,
      });
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === 'quantity' || id === 'total_amount' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sales-orders', formData);
      toast.success('Sales order created successfully');
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      console.warn('Backend unavailable, creating order locally:', error);
      const newOrder = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        order_number: `SO${(orders.length + 1).toString().padStart(5, '0')}`,
        status: 'Confirmed'
      };
      setOrders([newOrder, ...orders]);
      toast.success('Sales order created (Mock Session)');
      setIsDialogOpen(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setFormData({
      quotation_id: '',
      customer_name: '',
      product: '',
      quantity: 0,
      total_amount: 0,
      currency: 'USD',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
            Sales Orders
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage customer sales orders and deliveries
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-order-button" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              New Sales Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Sales Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="order-form">
              <div>
                <Label htmlFor="quotation_id">From Quotation</Label>
                <select
                  id="quotation_id"
                  data-testid="quotation-select"
                  value={formData.quotation_id}
                  onChange={(e) => handleQuotationChange(e.target.value)}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select a quotation</option>
                  {quotations.map((quote) => (
                    <option key={quote.id} value={quote.id}>
                      {quote.quotation_number} - {quote.customer_name}
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
                    onChange={handleChange}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="product">Product</Label>
                  <Input
                    id="product"
                    data-testid="product-input"
                    value={formData.product}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity (KG)</Label>
                  <Input
                    id="quantity"
                    data-testid="quantity-input"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total_amount">Total Amount</Label>
                  <Input
                    id="total_amount"
                    data-testid="amount-input"
                    type="number"
                    value={formData.total_amount}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
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
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-order-button" className="bg-teal-600 hover:bg-teal-700">
                  Create Order
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="orders-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-16">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No sales orders found. Create your first order to get started.
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="order-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{idx + 1}.</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.customer_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.product}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">{order.quantity} KG</td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                      {order.currency} {order.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
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

export default SalesOrders;