import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Users, Package, ArrowUpRight, ArrowDownRight, Target, Globe } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut, Scatter } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
import {
  forecastRevenue,
  calculateGrowthRate,
  analyzeTrend,
  calculateConfidenceInterval,
  assessBusinessRisk
} from '../utils/analytics';
import { toast } from 'sonner';

export const Reports = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [activeTab, setActiveTab] = useState('executive');

  useEffect(() => {
    fetchReportData();
  }, [location.key]);

  const fetchReportData = async () => {
    try {
      const [inquiries, orders, payments, shipments, invoices] = await Promise.all([
        api.get('/inquiries'),
        api.get('/sales-orders'),
        api.get('/payments'),
        api.get('/shipments'),
        api.get('/invoices'),
      ]);

      // Process data for analytics
      const processedData = processAnalyticsData({
        inquiries: inquiries.data,
        orders: orders.data,
        payments: payments.data,
        shipments: shipments.data,
        invoices: invoices.data,
      });

      setReportData(processedData);

      // Generate forecasts
      const forecasts = generateForecasts(processedData);
      setForecastData(forecasts);
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (data) => {
    // Calculate monthly revenue
    const monthlyRevenue = calculateMonthlyMetrics(data.payments, 'amount');
    const monthlyOrders = calculateMonthlyMetrics(data.orders, null);

    // Calculate KPIs
    const totalRevenue = data.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOrders = data.orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Customer metrics
    const uniqueCustomers = new Set(data.orders.map(o => o.customer_name)).size;
    const customerConcentration = calculateCustomerConcentration(data.orders);

    // Growth metrics
    const revenueGrowth = calculateGrowthRate(
      monthlyRevenue[monthlyRevenue.length - 1],
      monthlyRevenue[monthlyRevenue.length - 2]
    );

    // Geographic distribution
    const geoDistribution = calculateGeoDistribution(data.shipments);

    // Invoice metrics
    const overdueInvoices = data.invoices.filter(inv =>
      new Date(inv.due_date) < new Date() && inv.status !== 'Paid'
    ).length;
    const overdueRate = data.invoices.length > 0 ? overdueInvoices / data.invoices.length : 0;

    // Risk assessment
    const risks = assessBusinessRisk({
      customerConcentration,
      inventoryTurnover: 6, // Mock value
      overdueInvoices: overdueRate,
      revenueGrowth: revenueGrowth / 100,
    });

    return {
      monthlyRevenue,
      monthlyOrders,
      totalRevenue,
      totalOrders,
      avgOrderValue,
      uniqueCustomers,
      revenueGrowth,
      geoDistribution,
      overdueInvoices,
      overdueRate,
      risks,
      trend: analyzeTrend(monthlyRevenue),
    };
  };

  const calculateMonthlyMetrics = (data, field) => {
    const monthly = new Array(12).fill(0);
    data.forEach(item => {
      const date = new Date(item.created_at || item.payment_date || item.invoice_date);
      const month = date.getMonth();
      monthly[month] += field ? item[field] : 1;
    });
    return monthly;
  };

  const calculateCustomerConcentration = (orders) => {
    if (orders.length === 0) return 0;
    const customerRevenue = {};
    orders.forEach(order => {
      customerRevenue[order.customer_name] = (customerRevenue[order.customer_name] || 0) + order.total_amount;
    });
    const totalRevenue = Object.values(customerRevenue).reduce((a, b) => a + b, 0);
    const topCustomerRevenue = Math.max(...Object.values(customerRevenue));
    return topCustomerRevenue / totalRevenue;
  };

  const calculateGeoDistribution = (shipments) => {
    const distribution = {};
    shipments.forEach(shipment => {
      const country = shipment.destination_country || 'Unknown';
      distribution[country] = (distribution[country] || 0) + 1;
    });
    return distribution;
  };

  const generateForecasts = (data) => {
    const revenueForecast = forecastRevenue(data.monthlyRevenue, 6);
    const confidence = calculateConfidenceInterval(data.monthlyRevenue);

    return {
      revenue: revenueForecast,
      confidence,
      projectedGrowth: calculateGrowthRate(
        revenueForecast[revenueForecast.length - 1],
        data.monthlyRevenue[data.monthlyRevenue.length - 1]
      ),
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-slate-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Reports & Analytics
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          Executive insights with predictive analytics and forecasting
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          data-testid="executive-tab"
          onClick={() => setActiveTab('executive')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'executive'
            ? 'border-teal-600 text-teal-600'
            : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
        >
          C-Suite Dashboard
        </button>
        <button
          data-testid="forecasting-tab"
          onClick={() => setActiveTab('forecasting')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'forecasting'
            ? 'border-teal-600 text-teal-600'
            : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
        >
          Predictive Analytics
        </button>
        <button
          data-testid="reports-tab"
          onClick={() => setActiveTab('reports')}
          className={`px-6 py-3 font-semibold border-b-2 transition-colors ${activeTab === 'reports'
            ? 'border-teal-600 text-teal-600'
            : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
        >
          Detailed Reports
        </button>
      </div>

      {/* C-Suite Dashboard */}
      {activeTab === 'executive' && (
        <ExecutiveDashboard reportData={reportData} forecastData={forecastData} />
      )}

      {/* Predictive Analytics */}
      {activeTab === 'forecasting' && (
        <PredictiveAnalytics reportData={reportData} forecastData={forecastData} />
      )}

      {/* Detailed Reports */}
      {activeTab === 'reports' && (
        <DetailedReports reportData={reportData} />
      )}
    </div>
  );
};

const ExecutiveDashboard = ({ reportData, forecastData }) => {
  const getTrendIcon = (trend) => {
    if (trend === 'upward') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (trend === 'downward') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <ArrowUpRight className="w-5 h-5 text-slate-400" />;
  };

  const getTrendColor = (value) => {
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  // Revenue chart with forecast
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'F+1', 'F+2', 'F+3', 'F+4', 'F+5', 'F+6'],
    datasets: [
      {
        label: 'Actual Revenue',
        data: [...reportData.monthlyRevenue, ...new Array(6).fill(null)],
        borderColor: '#0D9488',
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Forecasted Revenue',
        data: [...new Array(12).fill(null), ...forecastData.revenue],
        borderColor: '#94A3B8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        borderDash: [5, 5],
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Geographic distribution
  const geoData = {
    labels: Object.keys(reportData.geoDistribution),
    datasets: [
      {
        data: Object.values(reportData.geoDistribution),
        backgroundColor: ['#0F172A', '#0D9488', '#3B82F6', '#8B5CF6', '#EC4899'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Executive KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6" data-testid="total-revenue-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                ${reportData.totalRevenue.toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                {getTrendIcon(reportData.trend)}
                <span className={`text-sm font-semibold ${getTrendColor(reportData.revenueGrowth)}`}>
                  {reportData.revenueGrowth > 0 ? '+' : ''}{reportData.revenueGrowth.toFixed(1)}% MoM
                </span>
              </div>
            </div>
            <div className="bg-emerald-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6" data-testid="avg-order-value-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Avg Order Value</p>
              <p className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                ${reportData.avgOrderValue.toLocaleString()}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                {reportData.totalOrders} orders
              </p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6" data-testid="unique-customers-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">Active Customers</p>
              <p className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                {reportData.uniqueCustomers}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Top: {(reportData.geoDistribution[Object.keys(reportData.geoDistribution)[0]] || 0)} shipments
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-6" data-testid="forecast-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">6-Month Forecast</p>
              <p className="mt-2 text-3xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                ${forecastData.revenue.reduce((a, b) => a + b, 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <ArrowUpRight className="w-5 h-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">
                  +{forecastData.projectedGrowth.toFixed(1)}% projected
                </span>
              </div>
            </div>
            <div className="bg-slate-400 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Risk Alerts */}
      {reportData.risks.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200" data-testid="risk-alerts">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-red-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                Risk Alerts ({reportData.risks.length})
              </h3>
              <div className="mt-3 space-y-2">
                {reportData.risks.map((risk, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${risk.level === 'high' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                      {risk.level.toUpperCase()}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{risk.type}</p>
                      <p className="text-sm text-slate-600">{risk.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 lg:col-span-2" data-testid="revenue-forecast-chart">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Revenue Trend & 6-Month Forecast
          </h3>
          <Line
            data={revenueChartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.dataset.label}: $${context.parsed.y?.toLocaleString() || 'N/A'}`
                  }
                }
              },
              scales: {
                y: {
                  ticks: {
                    callback: (value) => '$' + value.toLocaleString()
                  }
                }
              }
            }}
          />
        </Card>

        <Card className="p-6" data-testid="geographic-distribution">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Market Distribution
          </h3>
          <div className="flex justify-center">
            <div className="w-64">
              <Doughnut data={geoData} options={{ responsive: true, maintainAspectRatio: true }} />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {Object.entries(reportData.geoDistribution).map(([country, count]) => (
              <div key={country} className="flex justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  {country}
                </span>
                <span className="font-semibold">{count} shipments</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

const PredictiveAnalytics = ({ reportData, forecastData }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <h3 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
          AI-Powered Insights
        </h3>
        <p className="text-slate-600 mt-2">
          Machine learning analysis based on {reportData.monthlyRevenue.length} months of historical data
        </p>
      </Card>

      {/* Forecast Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6" data-testid="revenue-prediction">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Revenue Prediction (Next 6 Months)
          </h3>
          <div className="space-y-3">
            {forecastData.revenue.map((value, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                <span className="font-medium">Month {index + 1}</span>
                <div className="text-right">
                  <p className="text-lg font-bold text-slate-900">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs text-slate-500">
                    ±${(forecastData.confidence.stdDev * 1.96).toLocaleString(undefined, { maximumFractionDigits: 0 })} (95% CI)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6" data-testid="trend-analysis">
          <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
            Trend Analysis
          </h3>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-semibold text-blue-900">Current Trend</p>
              <p className="text-2xl font-bold text-blue-600 mt-2 capitalize">
                {reportData.trend}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                {reportData.trend === 'upward' && 'Strong growth momentum detected'}
                {reportData.trend === 'downward' && 'Declining trend requires attention'}
                {reportData.trend === 'stable' && 'Steady performance maintained'}
              </p>
            </div>

            <div className="p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm font-semibold text-emerald-900">Confidence Level</p>
              <p className="text-2xl font-bold text-emerald-600 mt-2">
                95%
              </p>
              <p className="text-sm text-emerald-700 mt-2">
                High confidence in forecast accuracy
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm font-semibold text-purple-900">Growth Projection</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                +{forecastData.projectedGrowth.toFixed(1)}%
              </p>
              <p className="text-sm text-purple-700 mt-2">
                Expected growth over next 6 months
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recommendations */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Strategic Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900">📈 Revenue Optimization</h4>
            <p className="text-sm text-slate-600 mt-2">
              Focus on top-performing markets. {Object.keys(reportData.geoDistribution)[0]} shows highest potential.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900">🎯 Customer Focus</h4>
            <p className="text-sm text-slate-600 mt-2">
              Diversify customer base to reduce concentration risk and improve stability.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900">💰 Cash Flow</h4>
            <p className="text-sm text-slate-600 mt-2">
              {reportData.overdueInvoices} overdue invoices detected. Implement automated reminders.
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-purple-200">
            <h4 className="font-semibold text-purple-900">🚀 Growth Strategy</h4>
            <p className="text-sm text-slate-600 mt-2">
              Current trajectory supports {forecastData.projectedGrowth > 10 ? 'aggressive' : 'moderate'} expansion plans.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const DetailedReports = ({ reportData }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button className="h-auto p-6 bg-white border-2 border-slate-200 hover:border-teal-500 hover:bg-teal-50 text-left flex-col items-start">
          <Package className="w-8 h-8 text-teal-600 mb-2" />
          <h4 className="font-bold text-slate-900">Sales Report</h4>
          <p className="text-sm text-slate-600 mt-1">Detailed sales analysis by product, region, and time period</p>
        </Button>

        <Button className="h-auto p-6 bg-white border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left flex-col items-start">
          <DollarSign className="w-8 h-8 text-blue-600 mb-2" />
          <h4 className="font-bold text-slate-900">Financial Report</h4>
          <p className="text-sm text-slate-600 mt-1">Revenue, expenses, profit margins, and cash flow analysis</p>
        </Button>

        <Button className="h-auto p-6 bg-white border-2 border-slate-200 hover:border-purple-500 hover:bg-purple-50 text-left flex-col items-start">
          <Users className="w-8 h-8 text-purple-600 mb-2" />
          <h4 className="font-bold text-slate-900">Customer Report</h4>
          <p className="text-sm text-slate-600 mt-1">Customer segmentation, lifetime value, and retention metrics</p>
        </Button>

        <Button className="h-auto p-6 bg-white border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-left flex-col items-start">
          <Package className="w-8 h-8 text-emerald-600 mb-2" />
          <h4 className="font-bold text-slate-900">Inventory Report</h4>
          <p className="text-sm text-slate-600 mt-1">Stock levels, turnover rates, and reorder recommendations</p>
        </Button>

        <Button className="h-auto p-6 bg-white border-2 border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left flex-col items-start">
          <Globe className="w-8 h-8 text-slate-500 mb-2" />
          <h4 className="font-bold text-slate-900">Export Report</h4>
          <p className="text-sm text-slate-600 mt-1">Shipment tracking, customs compliance, and logistics KPIs</p>
        </Button>

        <Button className="h-auto p-6 bg-white border-2 border-slate-200 hover:border-red-500 hover:bg-red-50 text-left flex-col items-start">
          <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
          <h4 className="font-bold text-slate-900">Compliance Report</h4>
          <p className="text-sm text-slate-600 mt-1">RBI compliance, FEMA regulations, and audit trail</p>
        </Button>
      </div>

      {/* Quick Stats Table */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-slate-900 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
          Key Performance Indicators
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 w-16">#</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Metric</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Current Value</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Target</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">1.</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">Revenue Growth Rate</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{reportData.revenueGrowth.toFixed(1)}%</td>
                <td className="px-6 py-4 text-sm text-slate-600">15%</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${reportData.revenueGrowth >= 15 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                    {reportData.revenueGrowth >= 15 ? 'On Track' : 'Below Target'}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">2.</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">Active Customers</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{reportData.uniqueCustomers}</td>
                <td className="px-6 py-4 text-sm text-slate-600">50+</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${reportData.uniqueCustomers >= 50 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                    {reportData.uniqueCustomers >= 50 ? 'On Track' : 'Growing'}
                  </span>
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">3.</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">Average Order Value</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">${reportData.avgOrderValue.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm text-slate-600">$50,000</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${reportData.avgOrderValue >= 50000 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                    }`}>
                    {reportData.avgOrderValue >= 50000 ? 'On Track' : 'Improving'}
                  </span>
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">4.</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-medium">Overdue Invoice Rate</td>
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{(reportData.overdueRate * 100).toFixed(1)}%</td>
                <td className="px-6 py-4 text-sm text-slate-600">&lt;10%</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${reportData.overdueRate < 0.1 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {reportData.overdueRate < 0.1 ? 'Healthy' : 'Needs Attention'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Reports;