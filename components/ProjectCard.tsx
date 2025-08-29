import { Project } from '@/types';
import { Calendar, DollarSign, Clock, MessageSquare, Edit2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  showActions?: boolean;
  onViewMessages?: (projectId: string) => void;
  onEdit?: (project: Project) => void;
  className?: string;
}

export default function ProjectCard({ 
  project, 
  showActions = false, 
  onViewMessages, 
  onEdit,  
  className 
}: ProjectCardProps) {
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
      <div className="p-5 flex-1 flex flex-col">
        {/* Header with status */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors duration-200 line-clamp-2">
            {project.title}
          </h3>
          <span className={statusConfig.className}>
            {statusConfig.icon}
            {String(project?.status || 'PENDING').replace(/_/g, ' ')}
          </span>
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
            <Clock size={12} className="mr-1.5" />
            <span>Created {formatDate(project.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {showActions && (
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