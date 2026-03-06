import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui/sonner';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

// Lazy loading page components
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Inquiries = lazy(() => import('./pages/Inquiries'));
const Samples = lazy(() => import('./pages/Samples'));
const LabTests = lazy(() => import('./pages/LabTests'));
const Chemicals = lazy(() => import('./pages/Chemicals'));
const Quotations = lazy(() => import('./pages/Quotations'));
const SalesOrders = lazy(() => import('./pages/SalesOrders'));
const PurchaseOrders = lazy(() => import('./pages/PurchaseOrders'));
const Shipments = lazy(() => import('./pages/Shipments'));
const Payments = lazy(() => import('./pages/Payments'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Reports = lazy(() => import('./pages/Reports'));
import './App.css';

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-vh-100 h-screen w-full bg-slate-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-teal-600 animate-spin"></div>
      <p className="text-slate-500 font-medium">Loading Kolorjet...</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
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
            <Route
              path="/invoices"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Invoices />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Reports />
                  </DashboardLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;