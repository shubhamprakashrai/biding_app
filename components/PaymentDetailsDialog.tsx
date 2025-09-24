"use client";

import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Image as ImageIcon, Upload, X, ArrowUpRight, Copy } from 'lucide-react';
import Image from 'next/image';

import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';

export interface PaymentStatusHistory {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: Timestamp | Date;
  updatedBy: string; // 'user' | 'admin'
  notes?: string;
}

export interface PaymentDetails {
  screenshot: string;
  amount: number;
  transactionId: string;
  notes: string;
  timestamp: Timestamp | Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  statusHistory?: PaymentStatusHistory[];  // Made optional with '?'
  adminNotes?: string;
}

interface PaymentDetailsDialogProps {
  projectId: string;
  isAdmin?: boolean;
  onSave: (details: Omit<PaymentDetails, 'timestamp' | 'status'>) => void;
  onStatusChange?: (status: 'APPROVED' | 'REJECTED', notes?: string) => void;
  initialData?: Partial<PaymentDetails>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PaymentDetailsDialog({
  projectId,
  isAdmin = false,
  onSave,
  onStatusChange,
  initialData,
  isOpen: externalIsOpen,
  onOpenChange: setExternalIsOpen,
}: PaymentDetailsDialogProps) {
  // Use controlled state if provided, otherwise use local state
  const [isOpen, setIsOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(initialData?.screenshot || null);
  const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
  const [transactionId, setTransactionId] = useState(initialData?.transactionId || '');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshot(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!screenshot) {
      toast.error('Please upload a payment screenshot');
      return;
    }
    if (!amount || isNaN(parseFloat(amount))) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!transactionId) {
      toast.error('Please enter a transaction ID');
      return;
    }
    
    try {
      setIsUploading(true);
      const paymentData = {
        screenshot: screenshot || '',
        amount: parseFloat(amount),
        transactionId: transactionId.trim(),
        notes: notes.trim()
      };
      
      await onSave(paymentData);
      setOpen(false);
      toast.success('Payment Submitted!', {
        description: 'Your payment details have been successfully submitted for review.',
        duration: 5000,
        icon: '✅',
        className: 'bg-green-50 border-green-200 text-green-700',
        position: 'top-center'
      });
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment details. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const isControlled = externalIsOpen !== undefined && setExternalIsOpen !== undefined;
  const open = isControlled ? externalIsOpen : isOpen;
  
  const setOpen = (value: boolean) => {
    if (isControlled && setExternalIsOpen) {
      setExternalIsOpen(value);
    } else {
      setIsOpen(value);
    }
    
    // Reset form when closing
    if (!value) {
      setScreenshot(initialData?.screenshot || null);
      setAmount(initialData?.amount?.toString() || '');
      setTransactionId(initialData?.transactionId || '');
      setNotes(initialData?.notes || '');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          {isAdmin ? 'View Payment Details' : 'Add Payment Details'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isAdmin ? 'Payment Details' : 'Submit Payment Details'}
          </DialogTitle>
        </DialogHeader>
        
        {isAdmin ? (
          <div className="space-y-6">
            {/* Payment Screenshot */}
            {screenshot && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Payment Proof</h3>
                <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                  <Image
                    src={screenshot}
                    alt="Payment Screenshot"
                    fill
                    className="object-contain p-2"
                  />
                  <a 
                    href={screenshot} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white p-1.5 rounded-md shadow-sm"
                    title="Open in new tab"
                  >
                    <ArrowUpRight className="h-4 w-4 text-gray-600" />
                  </a>
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Transaction Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    initialData?.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    initialData?.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {initialData?.status ? 
                      initialData.status.charAt(0).toUpperCase() + initialData.status.slice(1).toLowerCase() :
                      'Unknown'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Transaction ID:</span>
                  <div className="flex items-center">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {transactionId}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transactionId);
                        toast.success('Copied to clipboard');
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600"
                      title="Copy to clipboard"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {initialData?.timestamp && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Submitted on:</span>
                    <span className="font-medium">
                      {new Date(initialData.timestamp instanceof Date ? 
                        initialData.timestamp : 
                        initialData.timestamp.toDate()
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            {/* User Notes */}
            {notes && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">User Notes</h3>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                  {notes}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Admin Notes</h3>
                {initialData?.adminNotes && (
                  <span className="text-xs text-gray-500">
                    {initialData.timestamp && (
                      `Last updated: ${new Date(
                        initialData.timestamp instanceof Date ? 
                        initialData.timestamp : 
                        initialData.timestamp.toDate()
                      ).toLocaleString()}`
                    )}
                  </span>
                )}
              </div>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md text-sm min-h-[80px]"
                placeholder="Add internal notes about this payment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Status History */}
            {initialData?.statusHistory && initialData.statusHistory.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Status History</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {[...initialData.statusHistory].reverse().map((status, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                        status.status === 'APPROVED' ? 'bg-green-500' :
                        status.status === 'REJECTED' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {status.status.charAt(0).toUpperCase() + status.status.slice(1).toLowerCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {status.updatedBy === 'admin' ? 'Admin' : 'User'} • {
                              status.timestamp instanceof Date ? 
                              status.timestamp.toLocaleString() : 
                              status.timestamp.toDate().toLocaleString()
                            }
                          </span>
                        </div>
                        {status.notes && (
                          <p className="text-xs text-gray-600 mt-0.5">{status.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {onStatusChange && (
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                >
                  Close
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => onStatusChange('APPROVED', notes)}
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  Approve Payment
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => onStatusChange('REJECTED', notes)}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  Reject Payment
                </Button>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min={0}
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="transactionId">Transaction ID</Label>
              <Input
                id="transactionId"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                required
                placeholder="Enter transaction ID"
              />
            </div>
            <div>
              <Label>Payment Screenshot</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {screenshot ? (
                  <div className="relative w-full">
                    <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden">
                      <Image
                        src={screenshot}
                        alt="Payment Screenshot"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm border border-gray-200"
                    >
                      <X className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1 text-center">
                    <div className="flex justify-center">
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="screenshot-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none"
                      >
                        <span>Upload a file</span>
                        <input
                          id="screenshot-upload"
                          name="screenshot-upload"
                          type="file"
                          className="sr-only"
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Add any additional information about this payment..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isUploading}
                className="min-w-[120px]"
              >
                {isUploading ? 'Submitting...' : 'Submit Payment'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
