import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

export const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    sales_order_id: '',
    container_number: '',
    shipping_line: '',
    port_of_loading: '',
    destination_country: '',
    bl_number: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [shipmentsRes, ordersRes] = await Promise.all([
        api.get('/shipments'),
        api.get('/sales-orders'),
      ]);
      setShipments(shipmentsRes.data);
      setSalesOrders(ordersRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/shipments', formData);
      toast.success('Shipment created successfully');
      setIsDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error('Failed to create shipment');
    }
  };

  const resetForm = () => {
    setFormData({
      sales_order_id: '',
      container_number: '',
      shipping_line: '',
      port_of_loading: '',
      destination_country: '',
      bl_number: '',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Transit': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Delayed': return 'bg-red-100 text-red-800 border-red-200';
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
            Export Shipments
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Track international shipments and logistics
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-shipment-button" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              New Shipment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Export Shipment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="shipment-form">
              <div>
                <Label htmlFor="sales_order_id">Sales Order</Label>
                <select
                  id="sales_order_id"
                  data-testid="order-select"
                  value={formData.sales_order_id}
                  onChange={(e) => setFormData({ ...formData, sales_order_id: e.target.value })}
                  className="w-full border border-slate-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select sales order</option>
                  {salesOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.order_number} - {order.customer_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="container_number">Container Number</Label>
                  <Input
                    id="container_number"
                    data-testid="container-input"
                    value={formData.container_number}
                    onChange={(e) => setFormData({ ...formData, container_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shipping_line">Shipping Line</Label>
                  <Input
                    id="shipping_line"
                    data-testid="shipping-line-input"
                    value={formData.shipping_line}
                    onChange={(e) => setFormData({ ...formData, shipping_line: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="port_of_loading">Port of Loading</Label>
                  <Input
                    id="port_of_loading"
                    data-testid="port-input"
                    value={formData.port_of_loading}
                    onChange={(e) => setFormData({ ...formData, port_of_loading: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="destination_country">Destination Country</Label>
                  <Input
                    id="destination_country"
                    data-testid="destination-input"
                    value={formData.destination_country}
                    onChange={(e) => setFormData({ ...formData, destination_country: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bl_number">Bill of Lading Number (Optional)</Label>
                <Input
                  id="bl_number"
                  data-testid="bl-input"
                  value={formData.bl_number}
                  onChange={(e) => setFormData({ ...formData, bl_number: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-shipment-button" className="bg-teal-600 hover:bg-teal-700">
                  Create Shipment
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="shipments-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Shipment ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Container</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Shipping Line</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Port</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Destination</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">BL Number</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-slate-500">
                    No shipments found. Create your first shipment to get started.
                  </td>
                </tr>
              ) : (
                shipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="shipment-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{shipment.shipment_id}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{shipment.container_number}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{shipment.shipping_line}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{shipment.port_of_loading}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{shipment.destination_country}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {shipment.bl_number || <span className="text-slate-400 italic">Not assigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(shipment.status)}`}>
                        {shipment.status}
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

export default Shipments;