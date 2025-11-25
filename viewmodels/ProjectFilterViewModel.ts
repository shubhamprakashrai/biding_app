import { create } from 'zustand';
import { Project } from '@/types';

// Filter types
export type ProjectStatus = Project['status'];
export type AmountRange = 'all' | '0-500' | '500-1000' | '1000-5000' | '5000+';
export type DateRange = 'all' | 'today' | 'week' | 'month' | 'year';

export interface ProjectFilters {
  status: ProjectStatus | 'all';
  amountRange: AmountRange;
  dateRange: DateRange;
  email: string;
}

interface ProjectFilterState {
  // Filter state
  filters: ProjectFilters;

  // Actions
  setStatusFilter: (status: ProjectStatus | 'all') => void;
  setAmountFilter: (range: AmountRange) => void;
  setDateFilter: (range: DateRange) => void;
  setEmailFilter: (email: string) => void;
  resetFilters: () => void;

  // Computed
  applyFilters: (projects: Project[]) => Project[];
  getActiveFilterCount: () => number;
}

const defaultFilters: ProjectFilters = {
  status: 'all',
  amountRange: 'all',
  dateRange: 'all',
  email: ''
};

// Status options for the dropdown
export const statusOptions: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PAYMENT_PROCESSING', label: 'Payment Processing' },
  { value: 'PAYMENT_COMPLETED', label: 'Payment Completed' },
  { value: 'PAYMENT_UNDER_REVIEW', label: 'Payment Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'REJECTED', label: 'Rejected' }
];

// Amount range options
export const amountOptions: { value: AmountRange; label: string }[] = [
  { value: 'all', label: 'All Amounts' },
  { value: '0-500', label: '$0 - $500' },
  { value: '500-1000', label: '$500 - $1,000' },
  { value: '1000-5000', label: '$1,000 - $5,000' },
  { value: '5000+', label: '$5,000+' }
];

// Date range options
export const dateOptions: { value: DateRange; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' }
];

// Helper function to check if date is within range
const isDateInRange = (dateStr: string, range: DateRange): boolean => {
  if (range === 'all') return true;

  const date = new Date(dateStr);
  const now = new Date();

  switch (range) {
    case 'today':
      return date.toDateString() === now.toDateString();
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    case 'month':
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return date >= monthAgo;
    case 'year':
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return date >= yearAgo;
    default:
      return true;
  }
};

// Helper function to check if amount is in range
const isAmountInRange = (amount: number, range: AmountRange): boolean => {
  switch (range) {
    case 'all':
      return true;
    case '0-500':
      return amount >= 0 && amount <= 500;
    case '500-1000':
      return amount > 500 && amount <= 1000;
    case '1000-5000':
      return amount > 1000 && amount <= 5000;
    case '5000+':
      return amount > 5000;
    default:
      return true;
  }
};

/**
 * Project Filter ViewModel using Zustand
 * Manages filter state for project listings
 */
export const useProjectFilterViewModel = create<ProjectFilterState>((set, get) => ({
  // Initial state
  filters: { ...defaultFilters },

  // Set status filter
  setStatusFilter: (status) => {
    set((state) => ({
      filters: { ...state.filters, status }
    }));
  },

  // Set amount filter
  setAmountFilter: (amountRange) => {
    set((state) => ({
      filters: { ...state.filters, amountRange }
    }));
  },

  // Set date filter
  setDateFilter: (dateRange) => {
    set((state) => ({
      filters: { ...state.filters, dateRange }
    }));
  },

  // Set email filter
  setEmailFilter: (email) => {
    set((state) => ({
      filters: { ...state.filters, email }
    }));
  },

  // Reset all filters
  resetFilters: () => {
    set({ filters: { ...defaultFilters } });
  },

  // Apply filters to projects array
  applyFilters: (projects) => {
    const { filters } = get();

    return projects.filter((project) => {
      // Status filter
      if (filters.status !== 'all' && project.status !== filters.status) {
        return false;
      }

      // Amount filter (using budget field)
      if (!isAmountInRange(project.budget, filters.amountRange)) {
        return false;
      }

      // Date filter (using createdAt field)
      if (!isDateInRange(project.createdAt, filters.dateRange)) {
        return false;
      }

      // Email filter (case-insensitive partial match)
      if (filters.email.trim() !== '') {
        const searchEmail = filters.email.toLowerCase().trim();
        if (!project.email?.toLowerCase().includes(searchEmail)) {
          return false;
        }
      }

      return true;
    });
  },

  // Get count of active filters
  getActiveFilterCount: () => {
    const { filters } = get();
    let count = 0;

    if (filters.status !== 'all') count++;
    if (filters.amountRange !== 'all') count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.email.trim() !== '') count++;

    return count;
  }
}));

// Export hook alias
export const useProjectFilter = useProjectFilterViewModel;
