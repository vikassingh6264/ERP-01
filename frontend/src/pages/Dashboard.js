import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Card } from '../components/ui/card';
import { 
  Users, 
  FileText, 
  ShoppingCart, 
  DollarSign,
  TrendingUp,
  Package,
  AlertTriangle,
  Truck
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend);

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    try {
      let endpoint = '';
      if (user?.role === 'Marketing') endpoint = '/stats/marketing';
      else if (user?.role === 'Lab') endpoint = '/stats/lab';
      else if (user?.role === 'Logistics') endpoint = '/stats/logistics';
      else if (user?.role === 'Admin') endpoint = '/stats/admin';
      
      const response = await api.get(endpoint);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {user?.role} Dashboard
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Welcome back, {user?.full_name}
        </p>
      </div>

      {user?.role === 'Marketing' && <MarketingDashboard stats={stats} />}
      {user?.role === 'Lab' && <LabDashboard stats={stats} />}
      {user?.role === 'Logistics' && <LogisticsDashboard stats={stats} />}
      {user?.role === 'Admin' && <AdminDashboard stats={stats} />}
    </div>
  );
};

const MarketingDashboard = ({ stats }) => {
  const barData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        backgroundColor: '#0D9488',
      },
    ],
  };

  const lineData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Inquiries',
        data: [12, 19, 15, 25],
        borderColor: '#0F172A',
        backgroundColor: 'rgba(15, 23, 42, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          label="Total Inquiries"
          value={stats?.total_inquiries || 0}
          color="bg-blue-500"
          testId="total-inquiries-card"
        />
        <MetricCard
          icon={FileText}
          label="Pending Quotes"
          value={stats?.pending_quotes || 0}
          color="bg-slate-400"
          testId="pending-quotes-card"
        />
        <MetricCard
          icon={ShoppingCart}
          label="Sales Orders"
          value={stats?.sales_orders || 0}
          color="bg-teal-600"
          testId="sales-orders-card"
        />
        <MetricCard
          icon={DollarSign}
          label="Revenue"
          value={`$${(stats?.revenue || 0).toLocaleString()}`}
          color="bg-emerald-500"
          testId="revenue-card"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" data-testid="sales-chart">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Sales by Month
          </h3>
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true }} />
        </Card>

        <Card className="p-6" data-testid="inquiry-trend-chart">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Inquiry Trend
          </h3>
          <Line data={lineData} options={{ responsive: true, maintainAspectRatio: true }} />
        </Card>
      </div>
    </div>
  );
};

const LabDashboard = ({ stats }) => {
  const doughnutData = {
    labels: ['Received', 'In Testing', 'Completed'],
    datasets: [
      {
        data: [stats?.pending_samples || 0, 5, stats?.completed_tests || 0],
        backgroundColor: ['#94A3B8', '#3B82F6', '#10B981'],
      },
    ],
  };

  const barData = {
    labels: ['Sulfuric Acid', 'Sodium Chloride', 'Acetone', 'Ethanol', 'Benzene'],
    datasets: [
      {
        label: 'Usage (L)',
        data: [45, 32, 28, 50, 20],
        backgroundColor: '#0D9488',
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Package}
          label="Pending Samples"
          value={stats?.pending_samples || 0}
          color="bg-slate-400"
          testId="pending-samples-card"
        />
        <MetricCard
          icon={FlaskConical}
          label="Completed Tests"
          value={stats?.completed_tests || 0}
          color="bg-emerald-500"
          testId="completed-tests-card"
        />
        <MetricCard
          icon={AlertTriangle}
          label="Low Stock Alerts"
          value={stats?.low_stock_alerts || 0}
          color="bg-red-500"
          testId="low-stock-alerts-card"
        />
        <MetricCard
          icon={Package}
          label="Total Chemicals"
          value={stats?.total_chemicals || 0}
          color="bg-blue-500"
          testId="total-chemicals-card"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" data-testid="sample-status-chart">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Sample Status
          </h3>
          <div className="flex justify-center">
            <div className="w-64">
              <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </Card>

        <Card className="p-6" data-testid="chemical-usage-chart">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Chemical Usage
          </h3>
          <Bar data={barData} options={{ responsive: true, maintainAspectRatio: true, indexAxis: 'y' }} />
        </Card>
      </div>
    </div>
  );
};

const LogisticsDashboard = ({ stats }) => {
  const pieData = {
    labels: ['Air', 'Sea', 'Land'],
    datasets: [
      {
        data: [30, 50, 20],
        backgroundColor: ['#3B82F6', '#0D9488', '#94A3B8'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Truck}
          label="Active Shipments"
          value={stats?.active_shipments || 0}
          color="bg-blue-500"
          testId="active-shipments-card"
        />
        <MetricCard
          icon={Package}
          label="Pending Dispatches"
          value={stats?.pending_dispatches || 0}
          color="bg-slate-400"
          testId="pending-dispatches-card"
        />
        <MetricCard
          icon={TrendingUp}
          label="On-Time Delivery"
          value="95%"
          color="bg-emerald-500"
          testId="on-time-delivery-card"
        />
        <MetricCard
          icon={DollarSign}
          label="Freight Cost"
          value="$45,320"
          color="bg-teal-600"
          testId="freight-cost-card"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" data-testid="shipment-mode-chart">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Shipment Mode Distribution
          </h3>
          <div className="flex justify-center">
            <div className="w-64">
              <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
        </Card>

        <Card className="p-6" data-testid="logistics-image">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Global Shipping Routes
          </h3>
          <img
            src="https://images.unsplash.com/photo-1759272548470-d0686d071036?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2MzR8MHwxfHNlYXJjaHwyfHxnbG9iYWwlMjBzaGlwcGluZyUyMGNvbnRhaW5lciUyMHBvcnQlMjBsb2dpc3RpY3MlMjBleHBvcnR8ZW58MHx8fHwxNzcyNjI2MDIyfDA&ixlib=rb-4.1.0&q=85"
            alt="Global Shipping"
            className="w-full h-64 object-cover rounded-lg"
          />
        </Card>
      </div>
    </div>
  );
};

const AdminDashboard = ({ stats }) => {
  const areaData = {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [
      {
        label: 'Revenue Growth',
        data: [50000, 75000, 95000, 120000],
        borderColor: '#0D9488',
        backgroundColor: 'rgba(13, 148, 136, 0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Users}
          label="Total Users"
          value={stats?.total_users || 0}
          color="bg-blue-500"
          testId="total-users-card"
        />
        <MetricCard
          icon={FileText}
          label="Total Inquiries"
          value={stats?.total_inquiries || 0}
          color="bg-teal-600"
          testId="admin-inquiries-card"
        />
        <MetricCard
          icon={DollarSign}
          label="Total Revenue"
          value={`$${(stats?.total_revenue || 0).toLocaleString()}`}
          color="bg-emerald-500"
          testId="total-revenue-card"
        />
        <MetricCard
          icon={TrendingUp}
          label="Growth Rate"
          value="+24%"
          color="bg-slate-400"
          testId="growth-rate-card"
        />
      </div>

      <Card className="p-6" data-testid="revenue-growth-chart">
        <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Quarterly Revenue Growth
        </h3>
        <Line data={areaData} options={{ responsive: true, maintainAspectRatio: true }} />
      </Card>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, testId }) => {
  return (
    <Card className="p-6" data-testid={testId}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900 tabular-nums" style={{ fontFamily: 'Manrope, sans-serif' }}>
            {value}
          </p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

const FlaskConical = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10 2v8L6 18c-1 2 0 4 2 4h8c2 0 3-2 2-4l-4-8V2" />
    <path d="M8.5 2h7" />
    <path d="M7 16h10" />
  </svg>
);

export default Dashboard;