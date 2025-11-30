"use client";

import { useState,useEffect } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Image as ImageIcon, Upload, X, ArrowUpRight, Copy } from 'lucide-react';
import Image from 'next/image';
import { fetchAllUsers } from '@/utils/firebase/users';
import { User } from "@/types";
import { Timestamp,doc, updateDoc } from 'firebase/firestore';
import { db } from "@/app/firebase/firebase";
import { toast } from 'sonner';
import { showSuccessToast, showErrorToast } from "@/utils/auth/authToast";



async function assignDeveloper(projectId: string, devId: string, devName: string) {
  const ref = doc(db, "projects", projectId);
  console.log("Assigning developer:", devId, devName);
  await updateDoc(ref, {
    assignedTo: {
      uid: devId,
      name: devName,
    },
  });
}
export interface PaymentStatusHistory {
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  timestamp: Timestamp | Date;
  updatedBy: string; // 'user' | 'admin'
  notes?: string;
}

export interface PaymentDetails {
  screenshot: string;
  amount: number;
  paymentAmount: number;
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
  assignedTo?: { uid: string; name: string } | null;
  onSave: (details: Omit<PaymentDetails, 'timestamp' | 'status'>) => void;
  onStatusChange?: (status: 'APPROVED' | 'REJECTED', notes?: string) => void;
  initialData?: Partial<PaymentDetails>;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PaymentDetailsDialog({
  projectId,
  isAdmin = false,
  assignedTo,        // ← ADD THIS
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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDevId, setSelectedDevId] = useState("");
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
        notes: notes.trim(),
        paymentAmount: parseFloat(amount),
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

  useEffect(() => {
      async function loadUsers() {
          setLoading(true);
          const list = await fetchAllUsers();
          setUsers(list);
          setLoading(false);
      }
      loadUsers();
      }, []);
      const devUsers = users.filter(u => u.role === "DEV");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          {isAdmin ? 'View Payment Details' : 'Add Payment Details'}
        </Button>
      </DialogTrigger>
      {/* DEV User Dropdown - visible only for Admin */}
      {isAdmin && (
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={selectedDevId|| assignedTo?.uid || ""}
          onChange={async (e) => {
          const devId = e.target.value;
          setSelectedDevId(devId);

          const dev = devUsers.find((d) => d.id === devId);
          if (!dev) return;

          // 🔥 Call the project assignment function
          console.log("Assigning developer from dialog:", devId, dev.name);
          await assignDeveloper(projectId, dev.id, dev.name);

          showSuccessToast(`Assigned to ${dev.name}`);
        }}
        >
          <option value="">Select Developer</option>

          {devUsers.map((dev) => (
            <option key={dev.id} value={dev.id}>
              {dev.name}
            </option>
          ))}
        </select>
      )}
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
                  <span className="text-gray-500">Amount Paid:</span>
                  <span className="font-medium">
                    ₹{(initialData?.paymentAmount || parseFloat(amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
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
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-2">User Notes</h3>
                <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700 whitespace-pre-wrap">
                  {notes}
                </div>
              </div>
            )}


            {/* Status History */}
            {initialData?.statusHistory && initialData.statusHistory.length > 0 && (
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Status History</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {[...initialData.statusHistory].reverse().map((status, index) => (
                    <div key={index} className="relative pl-4 pb-3 border-l-2 border-gray-200 last:border-transparent">
                      <div className={`absolute -left-1.5 mt-1 h-3 w-3 rounded-full ${
                        status.status === 'APPROVED' ? 'bg-green-500' :
                        status.status === 'REJECTED' ? 'bg-red-500' :
                        'bg-yellow-500'
                      }`} />
                      <div className="ml-3">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                          <div className="flex items-center">
                            <span className={`text-sm font-medium ${
                              status.status === 'APPROVED' ? 'text-green-700' :
                              status.status === 'REJECTED' ? 'text-red-700' :
                              'text-yellow-700'
                            }`}>
                              {status.status.charAt(0).toUpperCase() + status.status.slice(1).toLowerCase()}
                            </span>
                            <span className="mx-2 text-gray-300">•</span>
                            <span className="text-xs text-gray-500">
                              {status.updatedBy === 'admin' ? 'Admin' : 'User'}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {status.timestamp instanceof Date ? 
                              status.timestamp.toLocaleString() : 
                              status.timestamp.toDate().toLocaleString()
                            }
                          </span>
                        </div>
                        {status.notes && (
                          <p className="text-xs text-gray-600 mt-1 pl-1 italic">
                            {status.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="px-6"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount Paid</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min={0}
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                  />
                </div>
              </div>
              <div>
                <Label>Total Payment Amount</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <Input
                    type="text"
                    value={initialData?.paymentAmount?.toFixed(2) || '0.00'}
                    readOnly
                    className="bg-gray-50 pl-7 font-medium text-gray-900"
                    disabled
                  />
                </div>
              </div>
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
