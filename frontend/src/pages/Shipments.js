import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Plus, FileDown, Building2, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { generateCommercialInvoice, generatePackingList, generateBillOfLading } from '../utils/documentGenerator';
import { generateCustomsDeclaration, generateCertificateOfOrigin, generateMSDS, generateBRC, generateFIRCSummary } from '../utils/customsDocuments';

export const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDocDialogOpen, setIsDocDialogOpen] = useState(false);
  const [isCustomsDialogOpen, setIsCustomsDialogOpen] = useState(false);
  const [isRBIDialogOpen, setIsRBIDialogOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
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
      const [shipmentsRes, ordersRes, inquiriesRes, paymentsRes] = await Promise.all([
        api.get('/shipments'),
        api.get('/sales-orders'),
        api.get('/inquiries'),
        api.get('/payments'),
      ]);
      setShipments(shipmentsRes.data);
      setSalesOrders(ordersRes.data);
      setInquiries(inquiriesRes.data);
      setPayments(paymentsRes.data);
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

  const openDocumentDialog = async (shipment) => {
    setSelectedShipment(shipment);
    try {
      const order = salesOrders.find(o => o.id === shipment.sales_order_id);
      setSelectedOrder(order);
      setIsDocDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const openCustomsDialog = async (shipment) => {
    setSelectedShipment(shipment);
    try {
      const order = salesOrders.find(o => o.id === shipment.sales_order_id);
      const inquiry = inquiries.find(i => i.id === order?.quotation_id);
      setSelectedOrder(order);
      setSelectedInquiry(inquiry);
      setIsCustomsDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load details');
    }
  };

  const openRBIDialog = async (shipment) => {
    setSelectedShipment(shipment);
    try {
      const order = salesOrders.find(o => o.id === shipment.sales_order_id);
      const payment = payments.find(p => p.customer === order?.customer_name);
      setSelectedOrder(order);
      setSelectedPayment(payment);
      setIsRBIDialogOpen(true);
    } catch (error) {
      toast.error('Failed to load payment details');
    }
  };

  const handleGenerateDocument = (type) => {
    if (!selectedShipment || !selectedOrder) {
      toast.error('Missing shipment or order details');
      return;
    }

    try {
      switch (type) {
        case 'invoice':
          generateCommercialInvoice(selectedOrder, selectedShipment);
          toast.success('Commercial Invoice downloaded');
          break;
        case 'packing':
          generatePackingList(selectedOrder, selectedShipment);
          toast.success('Packing List downloaded');
          break;
        case 'bol':
          generateBillOfLading(selectedShipment, selectedOrder);
          toast.success('Bill of Lading downloaded');
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to generate document');
    }
  };

  const handleGenerateCustomsDoc = (type) => {
    if (!selectedShipment || !selectedOrder) {
      toast.error('Missing required details');
      return;
    }

    try {
      switch (type) {
        case 'customs':
          generateCustomsDeclaration(selectedShipment, selectedOrder, selectedInquiry);
          toast.success('Customs Declaration downloaded');
          break;
        case 'coo':
          generateCertificateOfOrigin(selectedShipment, selectedOrder);
          toast.success('Certificate of Origin downloaded');
          break;
        case 'msds':
          generateMSDS(selectedOrder, selectedInquiry);
          toast.success('MSDS downloaded');
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to generate customs document');
    }
  };

  const handleGenerateRBIDoc = (type) => {
    if (!selectedPayment || !selectedOrder || !selectedShipment) {
      toast.error('Missing payment or shipment details');
      return;
    }

    try {
      switch (type) {
        case 'brc':
          generateBRC(selectedPayment, selectedOrder, selectedShipment);
          toast.success('Bank Realization Certificate downloaded');
          break;
        case 'firc':
          generateFIRCSummary([selectedPayment], new Date(selectedPayment.payment_date).toLocaleDateString(), new Date().toLocaleDateString());
          toast.success('FIRC Summary downloaded');
          break;
        default:
          break;
      }
    } catch (error) {
      toast.error('Failed to generate RBI document');
    }
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
                      <div className="flex gap-2">
                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(shipment.status)}`}>
                          {shipment.status}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="export-docs-button"
                          onClick={() => openDocumentDialog(shipment)}
                          className="border-teal-600 text-teal-600 hover:bg-teal-50"
                          title="Export Documents"
                        >
                          <FileDown className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="customs-docs-button"
                          onClick={() => openCustomsDialog(shipment)}
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          title="Customs Clearance"
                        >
                          <Building2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          data-testid="rbi-docs-button"
                          onClick={() => openRBIDialog(shipment)}
                          className="border-purple-600 text-purple-600 hover:bg-purple-50"
                          title="RBI Compliance"
                        >
                          <Landmark className="w-4 h-4" />
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

      {/* Export Documents Dialog */}
      <Dialog open={isDocDialogOpen} onOpenChange={setIsDocDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Documents - {selectedShipment?.shipment_id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Generate and download export documents for this shipment
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-teal-500" data-testid="commercial-invoice-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Commercial Invoice</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Official invoice for customs clearance and payment
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateDocument('invoice')}
                    data-testid="generate-invoice-button"
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-teal-500" data-testid="packing-list-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Packing List</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Detailed list of package contents and weights
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateDocument('packing')}
                    data-testid="generate-packing-button"
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer border-2 hover:border-teal-500" data-testid="bol-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Bill of Lading</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Shipping document and title of goods
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateDocument('bol')}
                    data-testid="generate-bol-button"
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-slate-500">
                All documents are generated in PDF format. Ensure all shipment and order details are accurate before generating documents.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Customs Clearance Documents Dialog */}
      <Dialog open={isCustomsDialogOpen} onOpenChange={setIsCustomsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Customs Clearance Documents - {selectedShipment?.shipment_id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Generate required customs clearance documentation for international chemical export
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow border-2 hover:border-blue-500" data-testid="customs-declaration-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Customs Declaration Form</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Official declaration for export customs clearance with HS codes
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateCustomsDoc('customs')}
                    data-testid="generate-customs-button"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow border-2 hover:border-blue-500" data-testid="coo-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Certificate of Origin</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Official certificate confirming Indian origin with Chamber seal
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateCustomsDoc('coo')}
                    data-testid="generate-coo-button"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow border-2 hover:border-blue-500" data-testid="msds-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">MSDS (Material Safety Data Sheet)</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Safety information and handling guidelines for chemical products
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateCustomsDoc('msds')}
                    data-testid="generate-msds-button"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>
            </div>

            <div className="pt-4 border-t bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-blue-900 font-medium">
                ⚠️ Important: Ensure all product details, HS codes, and safety information are verified before submission to customs authorities.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* RBI Compliance Documents Dialog */}
      <Dialog open={isRBIDialogOpen} onOpenChange={setIsRBIDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-purple-600" />
              RBI Compliance Documents - {selectedShipment?.shipment_id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Generate foreign exchange compliance documents for Reserve Bank of India (RBI)
            </p>
            
            <div className="grid grid-cols-1 gap-4">
              <Card className="p-4 hover:shadow-md transition-shadow border-2 hover:border-purple-500" data-testid="brc-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">Bank Realization Certificate (BRC)</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Certificate confirming foreign exchange realization from exports
                    </p>
                    {selectedPayment && (
                      <div className="mt-2 text-xs text-slate-500">
                        <span className="font-medium">Amount:</span> {selectedPayment.currency} {selectedPayment.amount.toLocaleString()} | 
                        <span className="ml-2 font-medium">FIRC:</span> {selectedPayment.firc_number || 'Pending'}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => handleGenerateRBIDoc('brc')}
                    data-testid="generate-brc-button"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!selectedPayment}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>

              <Card className="p-4 hover:shadow-md transition-shadow border-2 hover:border-purple-500" data-testid="firc-summary-card">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">FIRC Summary Report</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      Consolidated foreign inward remittance report for RBI
                    </p>
                  </div>
                  <Button
                    onClick={() => handleGenerateRBIDoc('firc')}
                    data-testid="generate-firc-button"
                    className="bg-purple-600 hover:bg-purple-700"
                    disabled={!selectedPayment}
                  >
                    <FileDown className="w-4 h-4 mr-2" />
                    Generate
                  </Button>
                </div>
              </Card>
            </div>

            <div className="pt-4 border-t bg-purple-50 rounded-lg p-3">
              <p className="text-xs text-purple-900 font-medium">
                📋 RBI Compliance: All foreign exchange receipts must be reported within stipulated time as per FEMA regulations. Ensure FIRC numbers are recorded for all international payments.
              </p>
            </div>

            {!selectedPayment && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-900">
                  ⚠️ No payment record found for this shipment. Please record the payment in the Payments module to generate RBI compliance documents.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shipments;