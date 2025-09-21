"use client";
import { Timestamp } from 'firebase/firestore';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
export interface PaymentStatusHistory {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: Timestamp | Date;
  updatedBy: string; 
  notes?: string;
}

interface PaymentHistoryProps {
  history: PaymentStatusHistory[];
  className?: string;
}

export function PaymentHistory({ history, className = '' }: PaymentHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No payment history available
      </div>
    );
  }
  
  // Sort history by timestamp in descending order (newest first)
  const sortedHistory = [...history].sort((a, b) => {
    const dateA = a.timestamp instanceof Date ? a.timestamp : a.timestamp.toDate();
    const dateB = b.timestamp instanceof Date ? b.timestamp : b.timestamp.toDate();
    return dateB.getTime() - dateA.getTime();
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-sm font-medium">Payment History</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {sortedHistory.map((item, index) => {
          const date = item.timestamp instanceof Date ? item.timestamp : item.timestamp.toDate();
          const formattedDate = format(date, 'MMM d, yyyy h:mm a');
          
          return (
            <div key={index} className="relative pl-6 pb-4 border-l-2 border-gray-200">
              {/* Timeline dot */}
              <div className="absolute -left-2.5 top-0 h-4 w-4 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                {getStatusIcon(item.status)}
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0) + item.status.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      by {item.updatedBy === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formattedDate}
                  </span>
                </div>
                
                {item.notes && (
                  <p className="text-sm text-gray-600 mt-1">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
