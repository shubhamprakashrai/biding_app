'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';

interface ProposalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proposal: any) => void;
  projectId: string;
  projectTitle: string;
}

export default function ProposalForm({ isOpen, onClose, onSubmit, projectId, projectTitle }: ProposalFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    proposedBudget: '',
    estimatedCompletion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      proposedBudget: parseFloat(formData.proposedBudget),
      projectId,
      id: Date.now().toString(),
      adminId: '2',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    });
    setFormData({ title: '', description: '', proposedBudget: '', estimatedCompletion: '' });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create Proposal</h2>
            <p className="text-gray-600 mt-1">For: {projectTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Brief title for your proposal..."
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Proposal Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              placeholder="Describe your approach, methodology, deliverables, and why you're the best fit for this project..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="proposedBudget" className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Budget (USD) *
              </label>
              <input
                type="number"
                id="proposedBudget"
                name="proposedBudget"
                value={formData.proposedBudget}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="4500"
              />
            </div>

            <div>
              <label htmlFor="estimatedCompletion" className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Completion *
              </label>
              <input
                type="date"
                id="estimatedCompletion"
                name="estimatedCompletion"
                value={formData.estimatedCompletion}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center space-x-2"
            >
              <Send size={20} />
              <span>Submit Proposal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}