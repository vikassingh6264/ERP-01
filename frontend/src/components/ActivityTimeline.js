import React from 'react';
import { CheckCircle, Clock, FileText, Package, Truck, DollarSign, FlaskConical, AlertCircle } from 'lucide-react';

export const ActivityTimeline = ({ activities, currentStage }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'inquiry': return FileText;
      case 'sample': return FlaskConical;
      case 'test': return FlaskConical;
      case 'quotation': return FileText;
      case 'sales_order': return Package;
      case 'shipment': return Truck;
      case 'payment': return DollarSign;
      default: return Clock;
    }
  };

  const getStatusColor = (type, status) => {
    const statusMap = {
      'inquiry': { New: 'blue', Quoted: 'amber', Closed: 'emerald' },
      'sample': { Received: 'blue', Tested: 'emerald' },
      'test': { Completed: 'emerald' },
      'quotation': { Sent: 'blue', Accepted: 'emerald', Rejected: 'red' },
      'sales_order': { Confirmed: 'blue', Processing: 'amber', Completed: 'emerald' },
      'shipment': { 'In Transit': 'blue', Delivered: 'emerald', Delayed: 'red' },
      'payment': { Received: 'emerald' },
    };
    
    const color = statusMap[type]?.[status] || 'slate';
    return {
      bg: `bg-${color}-100`,
      text: `text-${color}-800`,
      border: `border-${color}-200`,
      icon: `bg-${color}-500`,
    };
  };

  const getStageProgress = (stage) => {
    const stages = ['Inquiry', 'Sample Testing', 'Lab Testing', 'Quotation', 'Order Confirmed', 'In Transit', 'Completed'];
    const currentIndex = stages.indexOf(stage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  return (
    <div className="space-y-6">
      {/* Current Stage Banner */}
      <div className="bg-slate-900 text-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold" style={{ fontFamily: 'Manrope, sans-serif' }}>
              Current Stage: {currentStage}
            </h3>
            <p className="text-slate-300 mt-1">Track your customer journey through the complete workflow</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-teal-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${getStageProgress(currentStage)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Inquiry</span>
            <span>Testing</span>
            <span>Quotation</span>
            <span>Order</span>
            <span>Shipment</span>
            <span>Complete</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200" />

        {/* Activity Items */}
        <div className="space-y-6">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No activities found for this customer</p>
            </div>
          ) : (
            activities.map((activity, index) => {
              const Icon = getIcon(activity.type);
              const colors = getStatusColor(activity.type, activity.status);
              
              return (
                <div key={index} className="relative flex gap-4" data-testid="activity-item">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full ${colors.icon} flex items-center justify-center z-10`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
                          {activity.title}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {new Date(activity.date).toLocaleString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colors.bg} ${colors.text} ${colors.border}`}>
                        {activity.status}
                      </span>
                    </div>

                    {/* Additional Details */}
                    {activity.data && (
                      <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        {activity.type === 'quotation' && (
                          <>
                            <div>
                              <span className="text-slate-500">Quotation #:</span>
                              <span className="ml-1 font-medium text-slate-900">{activity.data.quotation_number}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Terms:</span>
                              <span className="ml-1 font-medium text-slate-900">{activity.data.export_terms}</span>
                            </div>
                          </>
                        )}
                        {activity.type === 'sales_order' && (
                          <>
                            <div>
                              <span className="text-slate-500">Order #:</span>
                              <span className="ml-1 font-medium text-slate-900">{activity.data.order_number}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Quantity:</span>
                              <span className="ml-1 font-medium text-slate-900">{activity.data.quantity} KG</span>
                            </div>
                          </>
                        )}
                        {activity.type === 'shipment' && (
                          <>
                            <div>
                              <span className="text-slate-500">Container:</span>
                              <span className="ml-1 font-medium text-slate-900">{activity.data.container_number}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Shipping Line:</span>
                              <span className="ml-1 font-medium text-slate-900">{activity.data.shipping_line}</span>
                            </div>
                          </>
                        )}
                        {activity.type === 'test' && (
                          <div className="col-span-2">
                            <span className="text-slate-500">Technician:</span>
                            <span className="ml-1 font-medium text-slate-900">{activity.data.technician_name}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityTimeline;