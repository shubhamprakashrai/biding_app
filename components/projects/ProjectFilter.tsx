'use client';

import { Filter, X, ChevronDown, Search } from 'lucide-react';
import {
  useProjectFilterViewModel,
  statusOptions,
  amountOptions,
  dateOptions,
  ProjectStatus,
  AmountRange,
  DateRange
} from '@/viewmodels/ProjectFilterViewModel';

interface ProjectFilterProps {
  showEmailFilter?: boolean;
}

export default function ProjectFilter({ showEmailFilter = true }: ProjectFilterProps) {
  const {
    filters,
    setStatusFilter,
    setAmountFilter,
    setDateFilter,
    setEmailFilter,
    resetFilters,
    getActiveFilterCount
  } = useProjectFilterViewModel();

  const activeCount = getActiveFilterCount();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Filter Header */}
        <div className="flex items-center gap-2 text-gray-700">
          <Filter size={18} />
          <span className="font-medium">Filters</span>
          {activeCount > 0 && (
            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {activeCount} active
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | 'all')}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200 text-sm"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Amount Filter */}
          <div className="relative">
            <select
              value={filters.amountRange}
              onChange={(e) => setAmountFilter(e.target.value as AmountRange)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200 text-sm"
            >
              {amountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <select
              value={filters.dateRange}
              onChange={(e) => setDateFilter(e.target.value as DateRange)}
              className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer transition-all duration-200 text-sm"
            >
              {dateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>

          {/* Email Filter (Searchable) */}
          {showEmailFilter && (
            <div className="relative">
              <input
                type="text"
                value={filters.email}
                onChange={(e) => setEmailFilter(e.target.value)}
                placeholder="Search by email..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-sm"
              />
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              {filters.email && (
                <button
                  onClick={() => setEmailFilter('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reset Button */}
        {activeCount > 0 && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>
    </div>
  );
}
