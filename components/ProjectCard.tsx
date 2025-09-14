import { Project } from '@/types';
import { Calendar, DollarSign, Clock, MessageSquare, Edit2, ArrowRight, ChevronDown, Check, X, Download, CreditCard, Loader2, Copy, QrCode, CheckCircle, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import dynamic from 'next/dynamic';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/firebase/firebase';
import PaymentDialog from './PaymentDialog';
import PaymentHistoryDialog from './PaymentHistoryDialog';
import DeliverablesUploadModal from './DeliverablesUpload';
import DeliverablesViewer from './DeliverablesViewer';

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

const statusOptions: { value: Project['status']; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PAYMENT_PROCESSING', label: 'Payment Processing' },
  { value: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
  { value: 'PAYMENT_UNDER_REVIEW', label: 'Payment Under Review' },
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
  // const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedQrCode, setSelectedQrCode] = useState<string | null>(project.paymentQrCode || null);
  const [showQrError, setShowQrError] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showQrCodeSelector, setShowQrCodeSelector] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);

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

  const handleStatusChange = async (newStatus: Project['status']) => {
    if (!project?.id) {
      console.error("Project ID missing for status change");
      return;
    }
  
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
          return;
        } catch (error) {
          console.error('Error updating project status:', error);
          return;
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
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };
  

  const getStatusConfig = (status: Project['status']) => {
    const baseStyles = 'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center border';
    
    switch (status) {
      case 'PENDING':
        return {
          className: `${baseStyles} bg-amber-500/10 text-amber-300 border-amber-500/30`,
          dot: 'w-2 h-2 rounded-full bg-amber-400 mr-1.5',
          icon: <Clock size={12} className="mr-1.5 text-amber-400" />
        };
      case 'IN_PROGRESS':
        return {
          className: `${baseStyles} bg-blue-500/10 text-blue-300 border-blue-500/30`,
          dot: 'w-2 h-2 rounded-full bg-blue-400 mr-1.5',
          icon: <div className="w-2 h-2 rounded-full bg-blue-400 mr-1.5 animate-pulse" />
        };
      case 'PAYMENT_PROCESSING':
      case 'PAYMENT_UNDER_REVIEW':
        return {
          className: `${baseStyles} bg-purple-500/10 text-purple-300 border-purple-500/30`,
          dot: 'w-2 h-2 rounded-full bg-purple-400 mr-1.5',
          icon: <div className="w-2 h-2 rounded-full bg-purple-400 mr-1.5 animate-pulse" />
        };
      case 'PAYMENT_COMPLETED':
      case 'COMPLETED':
        return {
          className: `${baseStyles} bg-emerald-500/10 text-emerald-300 border-emerald-500/30`,
          dot: 'w-2 h-2 rounded-full bg-emerald-400 mr-1.5',
          icon: <CheckCircle size={12} className="mr-1.5 text-emerald-400" />
        };
      case 'CANCELLED':
        return {
          className: `${baseStyles} bg-red-500/10 text-red-300 border-red-500/30`,
          dot: 'w-2 h-2 rounded-full bg-red-400 mr-1.5',
          icon: <X size={12} className="mr-1.5 text-red-400" />
        };
      default:
        return {
          className: `${baseStyles} bg-gray-500/10 text-gray-300 border-gray-500/30`,
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
      'group bg-gradient-to-br from-blue-900 to-blue-950 rounded-xl border-2 border-blue-600/50 hover:border-blue-400/80 hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col backdrop-blur-sm',
      'hover:shadow-blue-500/30 transform hover:-translate-y-1',
      'dark:from-blue-800/90 dark:to-blue-900/90 dark:border-blue-500/60 dark:hover:border-blue-300/80',
      'ring-2 ring-blue-500/10 hover:ring-blue-400/20',
      'transition-all duration-300 ease-in-out',
      className
    )}>
      <div className="p-5 flex-1 flex flex-col min-w-0">
        {/* Header with status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors duration-200 line-clamp-2">
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
                  <p className="mt-1 text-sm text-red-400">
                    Please select a QR code before setting status to Payment Processing
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <div className={cn(
              statusConfig.className,
              'inline-flex items-center backdrop-blur-sm',
              isAdmin && 'cursor-pointer hover:bg-opacity-30 transition-all'
            )}>
              {statusConfig.icon}
              {String(project?.status || 'PENDING').replace(/_/g, ' ')}
              {isAdmin && (
                <>
<ChevronDown 
                    size={14} 
                    className="ml-1 text-blue-200" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdownId(openDropdownId === project.id ? null : project.id);
                    }}
                  />
                  {openDropdownId === project.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-blue-900/95 backdrop-blur-sm rounded-lg shadow-xl z-10 border border-blue-700/50 overflow-hidden">
                      <div className="py-1">
                        {statusOptions.map((option) => {
                          const optionConfig = getStatusConfig(option.value);
                          return (
                            <button
                              key={option.value}
                              type="button"
                              className={cn(
                                'w-full text-left px-4 py-2.5 text-sm flex items-center justify-between',
                                'hover:bg-blue-800/80 transition-colors',
                                'text-blue-100',
                                project.status === option.value && 'bg-blue-700/50 text-white'
                              )}
                              onClick={() => {
                                setOpenDropdownId(null);
                                handleStatusChange(option.value);
                              }}
                            >
                              <div className="flex items-center">
                                <span className={optionConfig.dot.replace('mr-1.5', 'mr-2')}></span>
                                {option.label}
                              </div>
                              {project.status === option.value && <Check size={14} className="text-blue-300" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-blue-200/80 mb-5 text-sm leading-relaxed line-clamp-3">
          {project.description}
        </p>


        {/* Deliverables Upload */}

        {canUploadDeliverables && isAdmin && (
          <div className="mt-4">
            <Button 
              onClick={() => setShowDeliverableModal(true)} 
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-0 shadow-md hover:shadow-cyan-500/20 transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Deliverables
            </Button>

    <DeliverablesUploadModal
    projectId={project.id}
      open={showDeliverableModal}
      onClose={() => setShowDeliverableModal(false)}
    />
  </div>
)}

        {/* Payment Details Button */}
        <div className="mt-4 space-y-3 bg-blue-900/40 p-4 rounded-lg border border-blue-700/50 backdrop-blur-sm shadow-inner">
          {project.paymentProof && (
            <Button
              variant="outline"
              size="sm"
              className="w-full border-blue-600/50 text-blue-200 hover:bg-blue-700/30 hover:border-blue-500/70 hover:text-white transition-colors"
              onClick={() => window.open(project.paymentProof, '_blank')}
            >
              <Download className="w-4 h-4 mr-2" />
              View Payment Proof
            </Button>
          )}
          
          {project.transactionId && (
            <div className="text-sm p-3 bg-blue-900/30 rounded-md border border-blue-800/50">
              <p className="font-medium text-blue-100">Transaction ID:</p>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-blue-300/60">
                  Last updated: {formatDate(project.updatedAt || project.createdAt)}
                </span>
              </div>
              {project.payment?.verifiedAt && (
                <p className="text-xs text-blue-300/60">
                  Paid on: {new Date(project.payment.verifiedAt).toLocaleDateString()}
                </p>
              )}
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(project.transactionId || '');
                  // You might want to add a toast notification here
                }} 
                className="text-blue-300/70 hover:text-cyan-300 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {project.payments && project.payments.length > 0 ? (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full border-blue-600/50 text-blue-200 hover:bg-blue-700/30 hover:border-blue-500/70 hover:text-white transition-colors"
                onClick={() => setShowPaymentDialog(true)}
              >
                <Clock className="w-4 h-4 mr-2" />
                View Payment History
              </Button>
              
              <PaymentHistoryDialog
                open={showPaymentDialog}
                onClose={() => setShowPaymentDialog(false)}
                payments={project.payments}
              />
            </div>
          ) : null}
        </div>
        
        
        {/* Project metadata */}
        <div className="mt-auto space-y-3 pt-4 border-t border-blue-800/50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-blue-200/90">
              <DollarSign size={14} className="mr-1.5 text-cyan-400" />
              <span className="font-medium">${project.budget.toLocaleString()}</span>
            </div>
            <div className={cn(
              "flex items-center text-xs px-2.5 py-1 rounded-full border",
              isOverdue 
                ? "bg-red-500/10 text-red-300 border-red-500/30" 
                : "text-blue-200/80 border-blue-700/50"
            )}>
              <Calendar size={12} className="mr-1.5 text-blue-300/80" />
              <span>Due {formatDate(project.deadline??"")}</span>
              {isOverdue && (
                <span className="ml-1.5 px-2 py-0.5 bg-red-500/20 text-red-200 text-[10px] font-medium rounded-full border border-red-500/30">
                  Overdue
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center text-xs text-blue-200/60">
            <Clock size={12} className="mr-1.5 flex-shrink-0" />
            <span className="truncate">Created {formatDate(project.createdAt)}</span>
          </div>
          
          {/* Contact Information */}
          <div className="space-y-2 mt-3 pt-3 border-t border-blue-800/50">
            <h4 className="text-xs font-medium text-blue-200/80 uppercase tracking-wider">Contact Info</h4>
            {project.email && (
              <div className="flex items-center text-xs text-blue-200/80">
                <svg className="w-3.5 h-3.5 mr-2 text-blue-300/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a 
                  href={`mailto:${project.email}`} 
                  className="truncate hover:text-cyan-300 transition-colors"
                  title={project.email}
                >
                  {project.email}
                </a>
              </div>
            )}
           
            {project.phone && (
              <div className="flex items-center text-xs text-blue-200/80">
                <svg className="w-3.5 h-3.5 mr-2 text-blue-300/70 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a 
                  href={`tel:${project.phone}`} 
                  className="hover:text-cyan-300 transition-colors"
                  title={project.phone}
                >
                  {project.phone}
                </a>
              </div>
            )}

            {/* App Information */}
            {(project.aliasName || project.password || project.appLink || project.playStoreLink) && (
              <div className="mt-4 pt-4 border-t border-blue-800/50 space-y-3">
                <h4 className="text-xs font-medium text-blue-200/80 uppercase tracking-wider">App Information</h4>
                {project.aliasName && (
                  <div className="text-sm text-blue-200/90">
                    <span className="font-medium text-blue-300">Alias:</span>{' '}
                    <span className="font-mono">{project.aliasName}</span>
                  </div>
                )}
                {project.password && (
                  <div className="flex items-center text-sm text-blue-200/90">
                    <span className="font-medium text-blue-300">Password:</span>
                    <span className="ml-2 font-mono bg-blue-900/50 px-2 py-0.5 rounded text-blue-100">••••••••</span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(project.password || '');
                        // You might want to add a toast notification here
                      }} 
                      className="ml-2 text-blue-300/70 hover:text-cyan-300 transition-colors"
                      title="Copy password"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
                {project.appLink && (
                  <div className="text-sm">
                    <span className="font-medium text-blue-300">App:</span>{' '}
                    <a 
                      href={project.appLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-cyan-300 hover:underline truncate inline-block max-w-[200px]"
                      title={project.appLink}
                    >
                      {project.appLink.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                {project.playStoreLink && (
                  <div className="text-sm">
                    <span className="font-medium text-blue-300">Play Store:</span>{' '}
                    <a 
                      href={project.playStoreLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-200/80 hover:underline truncate inline-block max-w-[200px]"
                      title={project.playStoreLink}
                    >
                      {project.playStoreLink.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}

          </div>
          {project.status === 'PAYMENT_PROCESSING' && !isAdmin && (
            <div className="px-5 pb-4">
              <button 
                onClick={() => handlePaymentClick(project)}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-lg shadow-md hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <CreditCard size={16} />
                Make Payment
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
          <h4 className="text-sm font-medium text-blue-200/80 mb-3 uppercase tracking-wider">Attachments ({project.attachments.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {project.attachments.map((url, index) => (
              <div 
                key={index} 
                className="group relative rounded-lg overflow-hidden border border-blue-800/50 bg-blue-900/30 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 cursor-pointer"
                onClick={() => handleImageClick(index)}
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="bg-blue-500/90 rounded-full p-2 text-white transform group-hover:scale-110 transition-transform">
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

      {/* Show uploaded deliverables for users and admin */}
    {project.deliverables && project.deliverables.length >= 0 && (
  <DeliverablesViewer
    deliverables={project.deliverables}
    isAdmin={isAdmin}
  />
   )}

      {/* Payment Modal */}
      {showPaymentDetails && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowPaymentDetails(false)}
        >
          <div 
            ref={paymentModalRef}
            className="bg-white rounded-xl w-full max-w-md p-6 relative"
          >
            <button 
              onClick={() => setShowPaymentDetails(false)}
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
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsProcessing(true);
                    try {
                      // Simulate payment processing
                      await new Promise(resolve => setTimeout(resolve, 2000));
                      setPaymentSuccess(true);
                      if (onStatusChange) {
                        onStatusChange(project.id, 'PAYMENT_COMPLETED');
                      }
                    } catch (error) {
                      console.error('Error processing payment:', error);
                    } finally {
                      setIsProcessing(false);
                    }
                  }}
                  className="space-y-4"
                >
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
                      <p className="text-xs text-gray-500">
                        Please enter the transaction ID or UTR number from your payment receipt
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <label className="flex items-start">
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded mt-0.5"
                          required
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          I confirm that I have made the payment of ${project.budget.toLocaleString()} for &quot;{project.title}&quot;
                        </span>
                      </label>
                    </div>

                    <div className="mt-6 flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPaymentDetails(false)}
                        disabled={isProcessing}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Processing...
                          </>
                        ) : 'Confirm Payment'}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-4">
                      Your payment is secured with 256-bit encryption
                    </p>
                  </div>
                </form>
              ) : (
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-6">
                    Your payment confirmation has been received. We&apos;ll verify and update the project status shortly.
                  </p>
                  <Button 
                    onClick={() => {
                      setShowPaymentDetails(false);
                      setPaymentSuccess(false);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
