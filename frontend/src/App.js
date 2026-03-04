import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inquiries from './pages/Inquiries';
import Samples from './pages/Samples';
import LabTests from './pages/LabTests';
import Chemicals from './pages/Chemicals';
import Quotations from './pages/Quotations';
import SalesOrders from './pages/SalesOrders';
import PurchaseOrders from './pages/PurchaseOrders';
import Shipments from './pages/Shipments';
import Payments from './pages/Payments';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Navigate to="/dashboard" replace />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inquiries"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Inquiries />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/samples"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Samples />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lab-tests"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <LabTests />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chemicals"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Chemicals />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Quotations />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-orders"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SalesOrders />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchase-orders"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PurchaseOrders />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Shipments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Payments />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;