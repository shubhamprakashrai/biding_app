import { Project } from '@/types';
import { Calendar, DollarSign, Clock, MessageSquare, Edit2, ArrowRight, ChevronDown, Check, X, Download, CreditCard, Loader2, Copy, QrCode, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { PaymentQrUpload } from './PaymentQrUpload';

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

const statusOptions: { value: Project['status']; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PAYMENT_PROCESSING', label: 'Payment Processing' },
  { value: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' }
];

export default function ProjectCard({ 
  project, 
  showActions = false, 
  isAdmin = false,
  onViewMessages, 
  onEdit,  
  onStatusChange,
  className 
}: ProjectCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const paymentModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusChange = (newStatus: Project['status']) => {
    onStatusChange?.(project.id, newStatus);
    setIsStatusDropdownOpen(false);
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
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
            {project.title}
          </h3>
          <div className="flex items-center">
            <div className={cn(
              statusConfig.className,
              'inline-flex items-center',
              isAdmin && 'cursor-pointer hover:bg-opacity-90 transition-all'
            )}>
              {statusConfig.icon}
              {String(project?.status || 'PENDING').replace(/_/g, ' ')}
              {isAdmin && (
                <>
                  <ChevronDown 
                    size={14} 
                    className="ml-1" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsStatusDropdownOpen(!isStatusDropdownOpen);
                    }}
                  />
                  {isStatusDropdownOpen && (
                    <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        {statusOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={cn(
                              'w-full text-left px-4 py-2 text-sm flex items-center justify-between',
                              'hover:bg-gray-50',
                              project.status === option.value ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            )}
                            onClick={() => handleStatusChange(option.value)}
                          >
                            {option.label}
                            {project.status === option.value && <Check size={16} />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-5 text-sm leading-relaxed line-clamp-3">
          {project.description}
        </p>

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
          </div>
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
      {selectedImageIndex !== null && project.attachments && (
        <ImageViewer
          images={project.attachments}
          initialIndex={selectedImageIndex}
          onClose={closeImageViewer}
          projectTitle={project.title}
        />
      )}


      {/* Payment Action */}
      {showActions && projectStatus === 'PAYMENT_PROCESSING' && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {isAdmin ? (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Payment Setup</h3>
              <PaymentQrUpload
                projectId={project.id}
                currentQrCode={project.paymentQrCode}
                onUpload={async (file) => {
                  // TODO: Implement QR code upload logic
                  console.log('Uploading QR code:', file);
                  // Simulate upload
                  return new Promise(resolve => setTimeout(resolve, 1000));
                }}
                onRemove={async () => {
                  // TODO: Implement QR code removal logic
                  console.log('Removing QR code');
                  return new Promise(resolve => setTimeout(resolve, 500));
                }}
              />
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Payment Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Account Holder Name"
                      value={project.paymentDetails?.accountHolderName || ''}
                      onChange={(e) => {
                        // TODO: Handle UPI ID update
                      }}
                    />
                  </div>
                
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Account Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Account Holder Name"
                      value={project.paymentDetails?.accountName || ''}
                      onChange={(e) => {
                        // TODO: Handle account name update
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700">Complete Payment</h3>
                {project.paymentQrCode && (
                  <button
                    onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                    className="text-xs text-emerald-600 hover:text-emerald-700"
                  >
                    {showPaymentDetails ? 'Hide Details' : 'View Payment Details'}
                  </button>
                )}
              </div>
              
              {showPaymentDetails && project.paymentQrCode && (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="border rounded-lg p-4 bg-white">
                      <img
                        src={project.paymentQrCode}
                        alt="Payment QR Code"
                        className="w-48 h-48 object-contain mx-auto"
                      />
                      <p className="text-xs text-center text-gray-500 mt-2">Scan this QR code to make payment</p>
                    </div>
                  </div>

                  {(project.paymentDetails?.accountHolderName || project.paymentDetails?.accountName) && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-700">Payment Information</h4>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                      
                        {project.paymentDetails.accountHolderName && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Account Holder Name:</span>
                            <span className="font-medium">{project.paymentDetails.accountHolderName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => setShowPaymentModal(true)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      I've Made the Payment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPaymentModal(false)}
        >
          <div 
            ref={paymentModalRef}
            className="bg-white rounded-xl w-full max-w-md p-6 relative"
          >
            <button 
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-3">
                  <CreditCard className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {paymentSuccess ? 'Payment Confirmation' : 'Confirm Payment'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {paymentSuccess 
                    ? 'Thank you for your payment! We will verify and update the status shortly.'
                    : `Please confirm that you have made a payment of $${project.budget.toLocaleString()} for "${project.title}"`
                  }
                </p>
              </div>

              {!paymentSuccess ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Please make the payment using the provided QR code or payment details, then confirm your payment below.
                    </p>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">Transaction ID / UTR Number</label>
                      <input 
                        type="text" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Enter transaction ID or UTR number"
                        required
                      />
                      <p className="text-xs text-gray-500">Please enter the transaction ID or UTR number from your payment receipt</p>
                    </div>
                    
                    <div className="mt-4">
                      <label className="flex items-start">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          I confirm that I have made the payment of ${project.budget.toLocaleString()} for "{project.title}"
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowPaymentModal(false)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={async () => {
                        setIsProcessing(true);
                        try {
                          // TODO: Submit payment confirmation to the server
                          await new Promise(resolve => setTimeout(resolve, 1500));
                          setPaymentSuccess(true);
                          // Close modal after 2 seconds
                          setTimeout(() => {
                            setShowPaymentModal(false);
                            setPaymentSuccess(false);
                            // TODO: Refresh project status
                          }, 2000);
                        } catch (error) {
                          console.error('Error confirming payment:', error);
                          // TODO: Show error message
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4 mr-2" />
                          Confirming...
                        </>
                      ) : (
                        'Confirm Payment'
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-3">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-500 text-center">
                Your payment is secured with 256-bit encryption
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}