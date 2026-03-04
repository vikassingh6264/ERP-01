import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export const Chemicals = () => {
  const [chemicals, setChemicals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    chemical_name: '',
    stock_quantity: 0,
    unit: 'ml',
    minimum_stock_level: 0,
    supplier: '',
  });

  useEffect(() => {
    fetchChemicals();
  }, []);

  const fetchChemicals = async () => {
    try {
      const response = await api.get('/chemicals');
      setChemicals(response.data);
    } catch (error) {
      toast.error('Failed to fetch chemicals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/chemicals', formData);
      toast.success('Chemical added successfully');
      setIsDialogOpen(false);
      fetchChemicals();
      resetForm();
    } catch (error) {
      toast.error('Failed to add chemical');
    }
  };

  const resetForm = () => {
    setFormData({
      chemical_name: '',
      stock_quantity: 0,
      unit: 'ml',
      minimum_stock_level: 0,
      supplier: '',
    });
  };

  const isLowStock = (chemical) => {
    return chemical.stock_quantity <= chemical.minimum_stock_level;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Chemical Inventory
          </h1>
          <p className="mt-2 text-lg text-slate-600">
            Manage laboratory chemical stock and supplies
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="add-chemical-button" className="bg-slate-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Add Chemical
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Chemical</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="chemical-form">
              <div>
                <Label htmlFor="chemical_name">Chemical Name</Label>
                <Input
                  id="chemical_name"
                  data-testid="chemical-name-input"
                  value={formData.chemical_name}
                  onChange={(e) => setFormData({ ...formData, chemical_name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input
                    id="stock_quantity"
                    data-testid="stock-quantity-input"
                    type="number"
                    step="0.01"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    data-testid="unit-select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2"
                  >
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="minimum_stock_level">Minimum Stock Level</Label>
                <Input
                  id="minimum_stock_level"
                  data-testid="min-stock-input"
                  type="number"
                  step="0.01"
                  value={formData.minimum_stock_level}
                  onChange={(e) => setFormData({ ...formData, minimum_stock_level: parseFloat(e.target.value) })}
                  required
                />
              </div>
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
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-chemical-button" className="bg-teal-600 hover:bg-teal-700">
                  Add Chemical
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full" data-testid="chemicals-table">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Chemical Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Stock Quantity</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Min Level</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Unit</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Supplier</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              {chemicals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                    No chemicals found. Add your first chemical to get started.
                  </td>
                </tr>
              ) : (
                chemicals.map((chemical) => (
                  <tr key={chemical.id} className="border-b border-slate-100 hover:bg-slate-50" data-testid="chemical-row">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{chemical.chemical_name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                      {chemical.stock_quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 tabular-nums">
                      {chemical.minimum_stock_level}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{chemical.unit}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{chemical.supplier}</td>
                    <td className="px-6 py-4">
                      {isLowStock(chemical) ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-800 border border-red-200 px-2.5 py-0.5 text-xs font-semibold" data-testid="low-stock-badge">
                          <AlertTriangle className="w-3 h-3" />
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                          Sufficient
                        </span>
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

export default Chemicals;