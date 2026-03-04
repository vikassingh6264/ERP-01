// Predictive Analytics & Forecasting Functions

// Simple Moving Average for trend analysis
export const calculateMovingAverage = (data, period = 3) => {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
};

// Linear Regression for forecasting
export const linearRegression = (xData, yData) => {
  const n = xData.length;
  const sumX = xData.reduce((a, b) => a + b, 0);
  const sumY = yData.reduce((a, b) => a + b, 0);
  const sumXY = xData.reduce((sum, x, i) => sum + x * yData[i], 0);
  const sumX2 = xData.reduce((sum, x) => sum + x * x, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
};

// Forecast future values
export const forecastLinear = (historicalData, periods = 3) => {
  const xData = historicalData.map((_, i) => i);
  const yData = historicalData;
  
  const { slope, intercept } = linearRegression(xData, yData);
  
  const forecast = [];
  for (let i = 0; i < periods; i++) {
    const x = historicalData.length + i;
    forecast.push(slope * x + intercept);
  }
  
  return forecast;
};

// Calculate growth rate
export const calculateGrowthRate = (current, previous) => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Seasonal index calculation
export const calculateSeasonalIndex = (data, periodsPerYear = 12) => {
  const years = Math.floor(data.length / periodsPerYear);
  const seasonalSums = new Array(periodsPerYear).fill(0);
  const seasonalCounts = new Array(periodsPerYear).fill(0);
  
  data.forEach((value, index) => {
    const season = index % periodsPerYear;
    seasonalSums[season] += value;
    seasonalCounts[season]++;
  });
  
  const seasonalAverages = seasonalSums.map((sum, i) => sum / seasonalCounts[i]);
  const overallAverage = seasonalAverages.reduce((a, b) => a + b, 0) / periodsPerYear;
  
  return seasonalAverages.map(avg => avg / overallAverage);
};

// Confidence interval calculation
export const calculateConfidenceInterval = (data, confidence = 0.95) => {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  // Z-score for 95% confidence
  const zScore = confidence === 0.95 ? 1.96 : 2.58;
  const margin = zScore * (stdDev / Math.sqrt(data.length));
  
  return {
    mean,
    lower: mean - margin,
    upper: mean + margin,
    stdDev
  };
};

// Trend analysis
export const analyzeTrend = (data) => {
  if (data.length < 2) return 'insufficient_data';
  
  const xData = data.map((_, i) => i);
  const { slope } = linearRegression(xData, data);
  
  if (slope > 0.1) return 'upward';
  if (slope < -0.1) return 'downward';
  return 'stable';
};

// Revenue forecasting with seasonal adjustment
export const forecastRevenue = (monthlyRevenue, forecastMonths = 6) => {
  const seasonalIndices = calculateSeasonalIndex(monthlyRevenue);
  const baseForecast = forecastLinear(monthlyRevenue, forecastMonths);
  
  return baseForecast.map((value, i) => {
    const seasonIndex = (monthlyRevenue.length + i) % 12;
    return value * seasonalIndices[seasonIndex];
  });
};

// Customer lifetime value prediction
export const predictCLV = (avgOrderValue, purchaseFrequency, customerLifespan) => {
  return avgOrderValue * purchaseFrequency * customerLifespan;
};

// Churn risk calculation
export const calculateChurnRisk = (daysSinceLastOrder, avgDaysBetweenOrders) => {
  if (daysSinceLastOrder < avgDaysBetweenOrders) return 'low';
  if (daysSinceLastOrder < avgDaysBetweenOrders * 1.5) return 'medium';
  return 'high';
};

// Inventory optimization
export const calculateOptimalInventory = (avgDailyDemand, leadTime, safetyStock = 1.5) => {
  const reorderPoint = (avgDailyDemand * leadTime) * safetyStock;
  const economicOrderQuantity = Math.sqrt((2 * avgDailyDemand * 365 * 100) / 5); // Simplified EOQ
  
  return {
    reorderPoint: Math.ceil(reorderPoint),
    economicOrderQuantity: Math.ceil(economicOrderQuantity)
  };
};

// Risk assessment
export const assessBusinessRisk = (metrics) => {
  const risks = [];
  
  if (metrics.customerConcentration > 0.3) {
    risks.push({ level: 'high', type: 'Customer Concentration', message: 'Top customer represents >30% of revenue' });
  }
  
  if (metrics.inventoryTurnover < 4) {
    risks.push({ level: 'medium', type: 'Inventory Turnover', message: 'Low inventory turnover detected' });
  }
  
  if (metrics.overdueInvoices > 0.2) {
    risks.push({ level: 'high', type: 'Payment Delays', message: '>20% invoices overdue' });
  }
  
  if (metrics.revenueGrowth < 0) {
    risks.push({ level: 'high', type: 'Revenue Decline', message: 'Negative revenue growth trend' });
  }
  
  return risks;
};