import { Project } from '@/types';
import { Calendar, DollarSign, Clock, MessageSquare, Edit2, ArrowRight, ChevronDown, Check, X, Download, CreditCard, Loader2, Copy, QrCode, CheckCircle, AlertTriangle, Upload, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import dynamic from 'next/dynamic';
import { doc, updateDoc, serverTimestamp, getDoc, Timestamp, FieldValue } from 'firebase/firestore';
import { toast } from 'sonner';
import { db } from '@/app/firebase/firebase';
import PaymentDialog from './PaymentDialog';
import PaymentHistoryDialog from './PaymentHistoryDialog';
import DeliverablesUploadModal from './DeliverablesUpload';
import DeliverablesViewer from './DeliverablesViewer';
import { PaymentDetails, PaymentDetailsDialog, PaymentStatusHistory } from './PaymentDetailsDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

// Dynamically import QrCodeSelector to avoid SSR issues with Firestore
const QrCodeSelector = dynamic(() => import('./QrCodeSelector'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4">
      <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
    </div>
  )
});

interface ImageViewerProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  projectTitle: string;
}

const ImageViewer = ({ images, initialIndex, onClose, projectTitle }: ImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    
    try {
      setIsDownloading(true);
      const response = await fetch(images[currentIndex]);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', `${projectTitle}-${currentIndex + 1}.${images[currentIndex].split('.').pop()?.split('?')[0] || 'jpg'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!images.length) return null;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === modalRef.current && onClose()}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/10 p-2 rounded-full transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      <button 
        onClick={handlePrev}
        className="absolute left-4 text-white hover:bg-white/10 p-3 rounded-full transition-colors"
        aria-label="Previous image"
      >
        <ArrowRight className="rotate-180" size={24} />
      </button>

      <div className="relative max-w-4xl w-full max-h-[90vh] flex items-center justify-center">
        <img 
          src={images[currentIndex]} 
          alt={`${projectTitle} - ${currentIndex + 1}`}
          className="max-w-full max-h-[80vh] object-contain"
        />
      </div>

      <button 
        onClick={handleNext}
        className="absolute right-4 text-white hover:bg-white/10 p-3 rounded-full transition-colors"
        aria-label="Next image"
      >
        <ArrowRight size={24} />
      </button>

      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-full font-medium transition-colors ${
            isDownloading ? 'opacity-70' : 'hover:bg-gray-200'
          }`}
        >
          <Download size={18} />
          {isDownloading ? 'Downloading...' : 'Download'}
        </button>
      </div>

      <div className="absolute bottom-4 right-4 text-white/70 text-sm">
        {currentIndex + 1} / {images.length}
      </div>
    </div>
  );
};

interface ProjectCardProps {
  project: Project;
  showActions?: boolean;
  isAdmin?: boolean;
  onViewMessages?: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  onStatusChange?: (projectId: string, newStatus: Project['status']) => void;
  className?: string;
}

const allStatusOptions: { value: Project['status']; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PAYMENT_PROCESSING', label: 'Payment Processing' },
  { value: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
  { value: 'PAYMENT_UNDER_REVIEW', label: 'Payment Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

// Filter status options based on user role
const getStatusOptions = (isAdmin: boolean) => {
  if (isAdmin) {
    return allStatusOptions;
  }
  // For normal users, only show specific status options
  return allStatusOptions.filter(option => 
    ['PAYMENT_UNDER_REVIEW', 'CANCELLED', 'PAYMENT_PROCESSING'].includes(option.value)
  );
};

export default function ProjectCard({ 
  project, 
  showActions = false, 
  isAdmin = false,
  onViewMessages, 
  onEdit,  
  onStatusChange,
  className 
}: ProjectCardProps) {

  const [paymentId, setPaymentId] = useState<string>("");

  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(project.paymentQrCode || null);
  const [showQrCodeSelector, setShowQrCodeSelector] = useState(false);
  const [showQrError, setShowQrError] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const canUploadDeliverables =
  project.transactionId &&
  (project.status === "PAYMENT_COMPLETED" || 
   project.status === "PAYMENT_PROCESSING" ||
   project.status === "PAYMENT_UNDER_REVIEW");

  const handlePaymentClick = (proj: Project) => {
    setSelectedProject(proj);
    setOpen(true);
  };



  useEffect(() => {
    const fetchPaymentId = async () => {
      if (!project.paymentQrCode) return;

      try {
        const docRef = doc(db, "adminData", "qrCodes");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const qrCodes = docSnap.data().qrCodes || [];
          const found = qrCodes.find((qr: any) => qr.id === project.paymentQrCode);
          if (found) {
            setPaymentId(found.paymentId || "");
          }
        }
      } catch (err) {
        console.error("Error fetching paymentId:", err);
      }
    };

    fetchPaymentId();
  }, [project.paymentQrCode]);

  // Update selected QR code when project prop changes
  useEffect(() => {
    if (project.paymentQrCode) {
      setSelectedQrCode(project.paymentQrCode);
    }
  }, [project.paymentQrCode]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const paymentModalRef = useRef<HTMLDivElement>(null);




  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null); // close when clicking outside
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCancelProject = async () => {
    console.log('handleCancelProject called');
    if (!project?.id) {
      const errorMsg = 'No project ID found. Cannot cancel project.';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    const loadingToast = toast.loading('Cancelling project...');
    console.log('Attempting to cancel project:', project.id);
    
    try {
      // First update the local state for immediate UI feedback
      if (onStatusChange) {
        onStatusChange(project.id, 'CANCELLED');
      }
      
      // Then update Firestore
      const projectRef = doc(db, 'projects', project.id);
      console.log('Project ref created, updating document...');
      
      const updateData = {
        status: 'CANCELLED',
        updatedAt: serverTimestamp(),
        cancelledAt: serverTimestamp(),
        cancelledBy: 'user'
      };
      
      console.log('Updating with data:', updateData);
      await updateDoc(projectRef, updateData);
      
      console.log('Project cancelled successfully');
      toast.dismiss(loadingToast);
      
      // Close the dialog immediately
      setShowCancelConfirm(false);
      
      // Show success message
      toast.success('Project has been cancelled successfully', {
        duration: 2000
      });
      
      // Simple and reliable page refresh
      const refreshPage = () => {
        console.log('Refreshing page...');
        // Use the most reliable method first
        window.location.href = window.location.href;
        // If that doesn't work, try reload
        setTimeout(() => {
          window.location.reload();
        }, 100);
      };
      
      // Refresh after a short delay to allow the user to see the success message
      setTimeout(refreshPage, 1500);
    } catch (error) {
      console.error('Error details:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      toast.error('Failed to cancel project. Please try again.');
    }
  };

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project?.id) {
      console.error("Project ID missing for status change");
      return;
    }

    // For normal users, only allow specific status changes
    if (!isAdmin && !['PAYMENT_UNDER_REVIEW', 'CANCELLED', 'PAYMENT_PROCESSING'].includes(newStatus)) {
      console.error("Unauthorized status change attempt by normal user");
      toast.error("You don't have permission to perform this action.");
      return;
    }
    
    // For normal users, refresh the page after status change
    const shouldRefresh = !isAdmin;
  
    // For PAYMENT_PROCESSING, ensure we have a QR code
    if (newStatus === 'PAYMENT_PROCESSING') {
      // If no QR code is selected, show the QR code selector
      if (!selectedQrCode && !project.paymentQrCode) {
        setShowQrCodeSelector(true);
        setShowQrError(true);
        return;
      }
      
      // If we have a selected QR code but it's not saved to the project yet
      if (selectedQrCode && selectedQrCode !== project.paymentQrCode) {
        try {
          const projectRef = doc(db, 'projects', project.id);
          await updateDoc(projectRef, {
            paymentQrCode: selectedQrCode,
            status: 'PAYMENT_PROCESSING',
            updatedAt: serverTimestamp()
          });
          
          // Update local state and call the callback
          onStatusChange?.(project.id, 'PAYMENT_PROCESSING');
          setShowQrError(false);
          
          // Refresh the page for normal users
          if (shouldRefresh) {
            window.location.reload();
          }
          return; // Exit early after handling payment processing
        } catch (error) {
          console.error('Error updating QR code:', error);
          return;
        }
      } else if (project.paymentQrCode) {
        // If we already have a QR code saved, just update the status
        try {
          const projectRef = doc(db, 'projects', project.id);
          await updateDoc(projectRef, {
            status: 'PAYMENT_PROCESSING',
            updatedAt: serverTimestamp()
          });
          onStatusChange?.(project.id, 'PAYMENT_PROCESSING');
          setShowQrError(false);
          if (shouldRefresh) {
            window.location.reload();
          }
        } catch (error) {
          console.error('Error updating status:', error);
          toast.error('Failed to update status. Please try again.');
        }
      }
    }
    
    // For other status changes
    try {
      const projectRef = doc(db, 'projects', project.id);
      await updateDoc(projectRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      onStatusChange?.(project.id, newStatus);
      setShowQrError(false);
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`);
      if (shouldRefresh) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status. Please try again.');
    }
  };
  

  const handleSavePaymentDetails = async (details: Omit<PaymentDetails, 'timestamp' | 'status'>) => {
    if (!project?.id) {
      toast.error('Project ID is missing');
      return;
    }
    
    try {
      const projectRef = doc(db, 'projects', project.id);
      const now = new Date();
      const initialStatus = 'PENDING' as const;
      
      // First update the document with the payment details and a placeholder for statusHistory
      await updateDoc(projectRef, {
        'paymentDetails.screenshot': details.screenshot,
        'paymentDetails.amount': details.amount,
        'paymentDetails.transactionId': details.transactionId,
        'paymentDetails.notes': details.notes,
        'paymentDetails.status': initialStatus,
        'paymentDetails.timestamp': serverTimestamp(),
        status: 'PAYMENT_UNDER_REVIEW',
        updatedAt: serverTimestamp()
      });
      
      // Then update the statusHistory separately
      const statusEntry = {
        status: initialStatus,
        timestamp: serverTimestamp(),
        updatedBy: 'user',
        notes: 'Payment details submitted'
      };
      
      // Add the status history using arrayUnion
      await updateDoc(projectRef, {
        'paymentDetails.statusHistory': [statusEntry]
      });
      
      // Update local state with client-side timestamps
      const paymentDetails: PaymentDetails = {
        ...details,
        timestamp: now,
        status: initialStatus,
        statusHistory: [{
          ...statusEntry,
          timestamp: now
        }]
      };
      
      setPaymentDetails(paymentDetails);
      onStatusChange?.(project.id, 'PAYMENT_UNDER_REVIEW');
      toast.success('Payment details submitted successfully! Your payment is under review.', {
        description: 'We will notify you once your payment is verified.',
        duration: 5000,
      });
    } catch (error) {
      console.error('Error saving payment details:', error);
      toast.error('Failed to save payment details');
    }
  };

  const handlePaymentStatusChange = async (status: 'APPROVED' | 'REJECTED', adminNotes: string = '') => {
    if (!project?.id || !paymentDetails) return;
    
    try {
      const projectRef = doc(db, 'projects', project.id);
      const newStatus = status === 'APPROVED' ? 'PAYMENT_COMPLETED' : 'PAYMENT_PROCESSING';
      const statusUpdate = {
        status,
        timestamp: serverTimestamp(),
        updatedBy: 'admin',
        notes: adminNotes || `Payment ${status.toLowerCase()} by admin`
      };
      
      await updateDoc(projectRef, {
        'paymentDetails.status': status,
        'paymentDetails.statusHistory': [...(paymentDetails.statusHistory || []), statusUpdate],
        'paymentDetails.adminNotes': adminNotes || null,
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      
      // Update local state
      setPaymentDetails({
        ...paymentDetails,
        status,
        adminNotes: adminNotes || paymentDetails.adminNotes,
        statusHistory: [
          ...(paymentDetails.statusHistory || []),
          {
            ...statusUpdate,
            timestamp: new Date() // Use client-side timestamp for local state
          }
        ]
      });
      
      onStatusChange?.(project.id, newStatus);
      toast.success(`Payment ${status.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(`Failed to ${status.toLowerCase()} payment`);
    }
  };
  

  const getStatusConfig = (status: Project['status']) => {
    const baseStyles = 'px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center';
    
    switch (status) {
      case 'PENDING':
        return {
          className: `${baseStyles} bg-amber-50 text-amber-700 border border-amber-100`,
          dot: 'w-2 h-2 rounded-full bg-amber-500 mr-1.5',
          icon: <Clock size={12} className="mr-1.5 text-amber-500" />
        };
      case 'IN_PROGRESS':
        return {
          className: `${baseStyles} bg-blue-50 text-blue-700 border border-blue-100`,
          dot: 'w-2 h-2 rounded-full bg-blue-500 mr-1.5',
          icon: <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
        };
      case 'COMPLETED':
        return {
          className: `${baseStyles} bg-emerald-50 text-emerald-700 border border-emerald-100`,
          dot: 'w-2 h-2 rounded-full bg-emerald-500 mr-1.5',
          icon: <div className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5" />
        };
      case 'CANCELLED':
        return {
          className: `${baseStyles} bg-red-50 text-red-700 border border-red-100`,
          dot: 'w-2 h-2 rounded-full bg-red-500 mr-1.5',
          icon: <div className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
        };
      default:
        return {
          className: `${baseStyles} bg-gray-50 text-gray-700 border border-gray-100`,
          dot: 'w-2 h-2 rounded-full bg-gray-400 mr-1.5',
          icon: <div className="w-2 h-2 rounded-full bg-gray-400 mr-1.5" />
        };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Ensure status has a default value and is a string
  const projectStatus = project?.status || 'PENDING';
  const statusConfig = getStatusConfig(projectStatus as Project['status']);
  const isOverdue = new Date(project.deadline??"") < new Date() && projectStatus !== 'COMPLETED';

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeImageViewer = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'auto';
  };

  return (
    <div className={cn(
      'group bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 overflow-hidden h-full flex flex-col',
      className
    )}>
      <div className="p-5 flex-1 flex flex-col min-w-0">
        {/* Header with status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
              {project.title}
            </h3>
            {/* QR Code Selector for Payment Processing */}
            {(project.status === 'PAYMENT_PROCESSING' || showQrError) && isAdmin && (
              <div className="mt-2">
                <QrCodeSelector 
                  projectId={project.id}
                  currentQrCode={selectedQrCode || project.paymentQrCode}
                  onQrCodeSelect={setSelectedQrCode}
                />
                {showQrError && !selectedQrCode && (
                  <p className="mt-1 text-sm text-red-600">
                    Please select a QR code before setting status to Payment Processing
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center relative">
            <div className={cn(
              statusConfig.className,
              'inline-flex items-center',
              'cursor-pointer hover:bg-opacity-90 transition-all',
              'relative' // Add relative positioning to contain the dropdown
            )}>
              {statusConfig.icon}
              {String(project?.status || 'PENDING').replace(/_/g, ' ')}
              <ChevronDown 
                size={14} 
                className="ml-1" 
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdownId(openDropdownId === project.id ? null : project.id);
                }}
              />
              {openDropdownId === project.id && (
                <div className="absolute left-0 top-full mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    {getStatusOptions(isAdmin).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={cn(
                          'w-full text-left px-4 py-2 text-sm flex items-center justify-between',
                          'hover:bg-gray-50',
                          project.status === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                        )}
                        onClick={() => {
                          setOpenDropdownId(null); // close dropdown
                          handleStatusChange(option.value);
                        }}
                      >
                        {option.label}
                        {project.status === option.value && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-5 text-sm leading-relaxed line-clamp-3">
          {project.description}
        </p>

        {/* Payment Details */}
        {(paymentId || paymentDetails) && (
          <div className="mt-3 space-y-2">
            {paymentId && (
              <div className="flex items-center text-xs text-gray-500">
                <CreditCard size={12} className="mr-1.5 text-gray-400 flex-shrink-0" />
                <span>
                  Payment ID: <span className="font-mono">{paymentId}</span>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(paymentId);
                    toast.success('Payment ID copied to clipboard');
                  }}
                  className="ml-1.5 text-gray-400 hover:text-gray-600"
                  title="Copy to clipboard"
                >
                  <Copy size={12} />
                </button>
              </div>
            )}
            
            {paymentDetails && (
              <div className="mt-2 w-full space-y-2">
                {/* Payment Status Badge */}
                <div className="flex items-center gap-2">
                  {paymentDetails.status === 'PENDING' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Payment Pending Review
                    </span>
                  )}
                  {paymentDetails.status === 'REJECTED' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Payment Rejected
                    </span>
                  )}
                  {paymentDetails.status === 'APPROVED' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Payment Approved
                    </span>
                  )}
                </div>
                
                {/* Payment History Button - Only show if there's payment history */}
                {isAdmin && (paymentDetails?.statusHistory?.length ?? 0) > 0 && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-sm text-blue-600 hover:text-blue-700"
                      onClick={() => setShowPaymentHistory(true)}
                    >
                      View History
                    </Button>
                  </div>
                )}
                
                {/* Payment Details Dialog - Only show one at a time */}
                <PaymentDetailsDialog
                  key={`payment-dialog-${project.id}`}
                  projectId={project.id}
                  isAdmin={isAdmin}
                  onSave={handleSavePaymentDetails}
                  onStatusChange={isAdmin ? handlePaymentStatusChange : undefined}
                  initialData={paymentDetails || undefined}
                  isOpen={showPaymentDetails}
                  onOpenChange={setShowPaymentDetails}
                />
              </div>
            )}
            
            {/* Single source of truth for payment dialog */}
            {/* Payment status badges for non-admin users */}
            {!isAdmin && paymentDetails?.status === 'PENDING' && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Payment Submitted - Under Review
                </span>
              </div>
            )}
            
            {!isAdmin && paymentDetails?.status === 'REJECTED' && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Payment Rejected - Please update your payment details
                </span>
              </div>
            )}
            
            {!isAdmin && paymentDetails?.status === 'APPROVED' && (
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Payment Approved
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Status and Actions */}
        {/* <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {paymentId && (
            <div className="flex items-center">
              Payment ID: <span className="font-mono ml-1">{paymentId}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(paymentId);
                  toast.success('Payment ID copied to clipboard');
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
                aria-label="Copy payment ID"
              >
                <Copy size={14} />
              </button>
            </div>
          )}
        </div> */}

        {/* Deliverables Viewer - Show for users in payment processing or completed states */}
        {!isAdmin && project.deliverables && project.deliverables.length > 0 && (
          <div className="mt-3">
            <DeliverablesViewer 
              deliverables={project.deliverables}
              isAdmin={isAdmin}
              paymentStatus={project.status} // Pass the payment status
            />
          </div>
        )}


        {/* Action Buttons */}
        {showActions && (
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {onViewMessages && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onViewMessages(project.id)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </Button>
            )}
            {onEdit && !isAdmin && projectStatus === 'PENDING' && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onEdit(project)}
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {/* Cancel Project Button - Only show for non-admin users when status is PENDING */}
            {!isAdmin && projectStatus === 'PENDING' && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => setShowCancelConfirm(true)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancel Project
              </Button>
            )}
          </div>
        )}

{project.status !== 'CANCELLED' && project.status !== 'PENDING' && (
  <div className="mt-4 space-y-2">
    {isAdmin ? (
      // Admin view - Show deliverables upload
      <div className="space-y-2">
        <Button  
          onClick={() => setShowDeliverableModal(true)} 
          className="w-full bg-blue-500 hover:bg-blue-600"
          variant="outline"
        >
          <Upload className="mr-2 h-4 w-4 text-white" />
          <span className="text-white">Upload Deliverables</span>
        </Button>
        
        <DeliverablesUploadModal
          projectId={project.id}
          open={showDeliverableModal}
          onClose={() => setShowDeliverableModal(false)}
        />
      </div>
    ) : (
      // Normal user view - Show payment upload if needed
      project.status === 'PAYMENT_PROCESSING' && (
        <Button
          onClick={() => setShowPaymentDetails(true)}
          variant="outline"
          className="w-full bg-emerald-500 hover:bg-emerald-600"
        >
          <CreditCard className="mr-2 h-4 w-4 text-white" />
          <span className="text-white">Upload Payment Details</span>
        </Button>
      )
    )}
    
    {/* Payment Details Dialog */}
    <PaymentDetailsDialog
      isOpen={showPaymentDetails}
      onOpenChange={setShowPaymentDetails}
      projectId={project.id}
      isAdmin={isAdmin}
      initialData={{
        screenshot: project.paymentProof || '',
        amount: project.budget,
        transactionId: project.transactionId || '',
        notes: project.paymentNotes || '',
        // Map project status to payment status
        status: (() => {
          switch(project.status) {
            case 'PAYMENT_COMPLETED':
              return 'APPROVED';
            case 'REJECTED':
              return 'REJECTED';
            case 'PAYMENT_PROCESSING':
            case 'PAYMENT_UNDER_REVIEW':
              return 'PENDING';
            default:
              return 'PENDING';
          }
        })(),
        statusHistory: project.paymentStatusHistory || []
      }}
      onSave={async (paymentData) => {
        try {
          const projectRef = doc(db, 'projects', project.id);
          const paymentStatusHistory = project.paymentStatusHistory || [];
          
          // Add new status entry
          const newStatusEntry: PaymentStatusHistory = {
            status: 'PENDING',
            timestamp: new Date(),
            updatedBy: 'user',
            notes: 'Payment details submitted by user'
          };
          
          await updateDoc(projectRef, {
            paymentProof: paymentData.screenshot,
            transactionId: paymentData.transactionId,
            paymentNotes: paymentData.notes,
            status: 'PAYMENT_UNDER_REVIEW',
            paymentStatusHistory: [...paymentStatusHistory, newStatusEntry],
            updatedAt: serverTimestamp()
          });
          
          if (onStatusChange) {
            onStatusChange(project.id, 'PAYMENT_UNDER_REVIEW');
          }
          
          toast.success('Payment details submitted for review');
          return true;
        } catch (error) {
          console.error('Error saving payment details:', error);
          toast.error('Failed to save payment details');
          return false;
        }
      }}
      onStatusChange={async (status, notes) => {
        if (!isAdmin) return false;
        
        try {
          const projectRef = doc(db, 'projects', project.id);
          const newStatus = status === 'APPROVED' ? 'PAYMENT_COMPLETED' : 'CANCELLED';
          
          // Add to status history
          const newStatusEntry: PaymentStatusHistory = {
            status,
            timestamp: new Date(),
            updatedBy: 'admin',
            notes: notes || `Payment ${status.toLowerCase()} by admin`
          };
          
          await updateDoc(projectRef, {
            status: newStatus,
            paymentStatusHistory: [...(project.paymentStatusHistory || []), newStatusEntry],
            paymentNotes: notes || project.paymentNotes,
            updatedAt: serverTimestamp()
          });
          
          if (onStatusChange) {
            onStatusChange(project.id, newStatus);
          }
          
          toast.success(`Payment ${status.toLowerCase()} successfully`);
          return true;
        } catch (error) {
          console.error('Error updating payment status:', error);
          toast.error('Failed to update payment status');
          return false;
        }
      }}
    />
  </div>
)}
        
        {/* Project metadata */}
        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <DollarSign size={14} className="mr-1.5 text-emerald-500" />
              <span className="font-medium text-gray-700">${project.budget.toLocaleString()}</span>
            </div>
            <div className={cn(
              "flex items-center text-xs px-2 py-1 rounded",
              isOverdue ? "bg-red-50 text-red-700" : "text-gray-500"
            )}>
              <Calendar size={12} className="mr-1.5 text-gray-400" />
              <span>Due {formatDate(project.deadline??"")}</span>
              {isOverdue && <span className="ml-1.5 px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-medium rounded">Overdue</span>}
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-400">
            <Clock size={12} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">Created {formatDate(project.createdAt)}</span>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-1 mt-2 pt-2 border-t border-gray-100">
            {project.email && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a href={`mailto:${project.email}`} className="truncate hover:text-blue-600 transition-colors">
                  {project.email}
                </a>
              </div>
            )}
           
            {project.phone && (
              <div className="flex items-center text-xs text-gray-500">
                <svg className="w-3.5 h-3.5 mr-1.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a href={`tel:${project.phone}`} className="hover:text-blue-600 transition-colors">
                  {project.phone}
                </a>
              </div>
            )}

            {/* App Information */}
            {(project.aliasName || project.password || project.appLink || project.playStoreLink) && (
              <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider">App Information</h4>
                {project.aliasName && <div className="text-sm"><span className="font-medium">Alias:</span> {project.aliasName}</div>}
                {project.password && (
                  <div className="flex items-center text-sm">
                    <span className="font-medium">Password:</span>
                    <span className="ml-2 font-mono">••••••••</span>
                    <button onClick={() => navigator.clipboard.writeText(project.password || '')} className="ml-2 text-blue-500">
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {project.appLink && (
                  <div className="text-sm">
                    <span className="font-medium">App:</span>{' '}
                    <a href={project.appLink} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      {project.appLink.substring(0, 30)}{project.appLink.length > 30 ? '...' : ''}
                    </a>
                  </div>
                )}
                {project.playStoreLink && (
                  <div className="text-sm">
                    <span className="font-medium">Play Store:</span>{' '}
                    <a href={project.playStoreLink} target="_blank" rel="noopener" className="text-blue-600 hover:underline">
                      {project.playStoreLink.substring(0, 30)}{project.playStoreLink.length > 30 ? '...' : ''}
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>
          {project.status === 'PAYMENT_PROCESSING' && !isAdmin && (
          <div className="flex items-center w-full px-5 pb-4">
            <button 
            onClick={() => handlePaymentClick(project)}
            className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:from-blue-600 hover:to-indigo-700 hover:shadow-lg transition-all duration-300">
             User Payment
            </button>
          </div>
          )}
          {selectedProject && (
            <PaymentDialog
            projectId={selectedProject.id}
              open={open}
              onClose={setOpen}
              qrId={selectedProject.paymentQrCode || ""}
              projectName={selectedProject.title}
            />
          )}
        </div>
      </div>

      {/* Attachments */}
      {project.attachments && project.attachments.length > 0 && (
        <div className="px-5 pb-5">
          <h4 className="text-sm font-medium text-gray-500 mb-2">Attachments ({project.attachments.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.attachments.map((url, index) => (
              <div 
                key={index} 
                className="group relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="bg-white/90 rounded-full p-2 text-gray-800 transform group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="15 9 12 12 9 9"></polyline>
                      <line x1="12" y1="12" x2="12" y2="15"></line>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImageIndex !== null && project.attachments && (project.attachments && (
        <ImageViewer
          images={project.attachments}
          initialIndex={selectedImageIndex}
          onClose={closeImageViewer}
          projectTitle={project.title}
        />
      ))}
      
      
      {/* QR Code Selector Modal */}
      {showQrCodeSelector && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowQrCodeSelector(false)}
        >
          <div 
            className="bg-white rounded-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowQrCodeSelector(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Select Payment QR Code</h3>
              <QrCodeSelector 
                onSelectQrCode={(qrCode) => {
                  setSelectedQrCode(qrCode);
                  setShowQrError(false);
                  setShowQrCodeSelector(false);
                  // Automatically update status after QR code selection
                  handleStatusChange('PAYMENT_PROCESSING');
                }} 
              />
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowQrCodeSelector(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    

    

      {/* Cancel Project Confirmation Dialog */}
      {showCancelConfirm && (
        <div 
          className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
          onClick={(e) => {
            console.log('Dialog overlay clicked');
            if (e.target === e.currentTarget) {
              setShowCancelConfirm(false);
            }
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center mb-2">Cancel Project</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to cancel this project? This action cannot be undone.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  console.log('No button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  setShowCancelConfirm(false);
                }}
                className="flex-1"
                type="button"
              >
                No, Keep Project
              </Button>
              <Button 
                variant="destructive" 
                onClick={(e) => {
                  console.log('Yes button clicked');
                  e.preventDefault();
                  e.stopPropagation();
                  handleCancelProject().catch(error => {
                    console.error('Error in handleCancelProject:', error);
                    toast.error('Failed to cancel project');
                  });
                }}
                className="flex-1"
                type="button"
                autoFocus
              >
                Yes, Cancel Project
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Details Popup */}
      <Dialog open={showPaymentPopup} onOpenChange={setShowPaymentPopup}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentDetails ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount</p>
                    <p className="font-medium">${paymentDetails.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Status</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      paymentDetails.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      paymentDetails.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {paymentDetails.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm break-all">{paymentDetails.transactionId}</p>
                </div>
                
                {paymentDetails.screenshot && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Payment Proof</p>
                    <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden">
                      <img 
                        src={paymentDetails.screenshot} 
                        alt="Payment proof" 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                
                {paymentDetails.notes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-sm whitespace-pre-wrap">{paymentDetails.notes}</p>
                  </div>
                )}
                
                {paymentDetails.adminNotes && isAdmin && (
                  <div className="bg-yellow-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Admin Notes</p>
                    <p className="text-sm text-yellow-700 whitespace-pre-wrap">{paymentDetails.adminNotes}</p>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No payment details available</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  size="sm"
                  onClick={() => {
                    setShowPaymentPopup(false);
                    setShowPaymentDetails(true);
                  }}
                >
                  Add Payment Details
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
