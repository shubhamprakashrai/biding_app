import { Project } from '@/types';
import { Calendar, DollarSign, Clock, MessageSquare, Edit2, ArrowRight, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useRef, useEffect } from 'react';

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
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

      {/* Actions */}
      {showActions && !isAdmin && projectStatus === 'PENDING' && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <div className="flex space-x-2">
            <button 
              className="flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors duration-200 group/button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(project);
              }}
            >
              <Edit2 size={14} className="mr-1.5 text-gray-500 group-hover/button:rotate-[-10deg] transition-transform duration-200" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}