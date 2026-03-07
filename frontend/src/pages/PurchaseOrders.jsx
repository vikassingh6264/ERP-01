import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    supplier: '',
    product: '',
    quantity: 0,
    unit_price: 0,
    currency: 'USD',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/purchase-orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/purchase-orders', formData);
      toast.success('Purchase order created successfully');
      setIsDialogOpen(false);
      fetchOrders();
      resetForm();
    } catch (error) {
      toast.error('Failed to create purchase order');
    }
  };

  const resetForm = () => {
    setFormData({
      supplier: '',
      product: '',
      quantity: 0,
      unit_price: 0,
      currency: 'USD',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Received': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
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
            Purchase Orders
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage supplier purchase orders and procurement
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-po-button" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              New PO
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="po-form">
              <div>
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  data-testid="supplier-input"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
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
              <div className="grid grid-cols-3 gap-4">
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
                  <Label htmlFor="unit_price">Unit Price</Label>
                  <Input
                    id="unit_price"
                    data-testid="price-input"
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
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-po-button" className="bg-teal-600 hover:bg-teal-700">
                  Create PO
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="po-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900 w-16">#</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Product</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Total Amount</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No purchase orders found. Create your first PO to get started.
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="po-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{idx + 1}.</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.supplier}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{order.product}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">{order.quantity} KG</td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                      {order.currency} {order.total_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(order.status)}`}>
                        Active
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

export default PurchaseOrders;