'use client';

import { useEffect, useState, useMemo } from 'react';
import { ProjectCard, ProjectFilter } from '@/components/projects';
import { proposals as initialProposals, messages as initialMessages } from '@/data/dummy';
import { Project, Proposal, Message } from '@/types';
import { Users, Briefcase, FileText, DollarSign, Image as ImageIcon } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase/FirebaseService';
import { QrUpload, QrCodeDropdown } from '@/components/payments';
import { useProjectsViewModel } from '@/viewmodels/ProjectsViewModel';
import { useProjectFilterViewModel } from '@/viewmodels/ProjectFilterViewModel';

export default function AdminPage() {
  // Use global projects store
  const {
    projects,
    isLoading,
    isInitialized,
    initializeAllProjects
  } = useProjectsViewModel();

  // Use filter store
  const { filters, applyFilters, getActiveFilterCount } = useProjectFilterViewModel();

  // Apply filters to projects - include filters in dependency to trigger re-render on filter change
  const filteredProjects = useMemo(() => {
    return applyFilters(projects);
  }, [projects, filters, applyFilters]);

  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
  const [selectedProjectForProposal, setSelectedProjectForProposal] = useState<Project | null>(null);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState<string | null>(null);
  const [qrRefreshTrigger, setQrRefreshTrigger] = useState(0);

  // Mock current admin user
  const currentUser = {
    id: '2',
    name: 'Admin User',
    role: 'ADMIN' as const
  };

  // Initialize projects from global store (cached)
  useEffect(() => {
    initializeAllProjects();
  }, [initializeAllProjects]);

  const handleCreateProposal = (newProposal: Proposal) => {
    setProposals(prev => [newProposal, ...prev]);
    setIsProposalFormOpen(false);
    setSelectedProjectForProposal(null);
  };

  const handleProposeForProject = (project: Project) => {
    setSelectedProjectForProposal(project);
    setIsProposalFormOpen(true);
  };

  const handleViewMessages = (projectId: string) => {
    setSelectedProjectForChat(projectId);
  };

  const handleStatusChange = async (projectId: string, newStatus: Project['status']) => {
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, { status: newStatus });
      // The onSnapshot listener in ProjectsViewModel will automatically update the UI
    } catch (error) {
      console.error('Error updating project status:', error);
    }
  };

  const handleSendMessage = (content: string) => {
    if (!selectedProjectForChat) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      projectId: selectedProjectForChat,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMessage]);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectForChat);

  const activeFilterCount = getActiveFilterCount();

  const stats = {
    totalProjects: projects.length,
    filteredProjects: filteredProjects.length,
    activeProposals: proposals.filter(p => p.status === 'PENDING').length,
    acceptedProposals: proposals.filter(p => p.status === 'ACCEPTED').length,
    totalRevenue: proposals.filter(p => p.status === 'ACCEPTED').reduce((sum, p) => sum + p.proposedBudget, 0)
  };

  // Show loading only on initial load
  if (isLoading && !isInitialized) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (<div className="min-h-screen bg-gray-50">

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage projects, proposals, and client communications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <Briefcase className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Proposals</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.activeProposals}</p>
            </div>
            <FileText className="text-yellow-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accepted</p>
              <p className="text-2xl font-bold text-green-600">{stats.acceptedProposals}</p>
            </div>
            <Users className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <DollarSign className="text-purple-600" size={24} />
          </div>
        </div>

        {/* QR Code Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">QR Code Management</h3>
                <p className="text-sm text-gray-500">Upload and manage your QR codes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">Upload New QR Code</h4>
                  <div className="p-2 rounded-full bg-indigo-100">
                    <ImageIcon className="text-indigo-600" size={16} />
                  </div>
                </div>
                <QrUpload onUploadSuccess={() => setQrRefreshTrigger(prev => prev + 1)} />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-800">Manage QR Codes</h4>
                  <div className="p-2 rounded-full bg-green-100">
                    <ImageIcon className="text-green-600" size={16} />
                  </div>
                </div>
                <QrCodeDropdown key={qrRefreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      </div>



      {/* Project Filters */}
      <ProjectFilter showEmailFilter={true} />

      {/* Available Projects */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Briefcase size={20} />
              <span>Available App</span>
            </h2>
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{stats.filteredProjects}</span> of{' '}
              <span className="font-medium text-gray-700">{stats.totalProjects}</span> projects
              {activeFilterCount > 0 && (
                <span className="ml-2 text-emerald-600">({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied)</span>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredProjects.map((project) => (
                <div key={project.id} className="relative">
                  <ProjectCard
                    key={project.id}
                    project={project}
                    showActions={true}
                    isAdmin={currentUser.role === 'ADMIN'}
                    onViewMessages={handleViewMessages}
                    onStatusChange={handleStatusChange}
                    onEdit={(project) => {
                      console.log('Edit project:', project);
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No projects found</h3>
              <p className="text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>);
}
