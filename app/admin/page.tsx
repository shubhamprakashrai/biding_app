'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import ProposalForm from '@/components/ProposalForm';
import ChatComponent from '@/components/ChatComponent';
import { projects as initialProjects, proposals as initialProposals, messages as initialMessages } from '@/data/dummy';
import { Project, Proposal, Message } from '@/types';
import { Users, Briefcase, FileText, MessageSquare, DollarSign } from 'lucide-react';

export default function AdminPage() {
  const [projects] = useState<Project[]>(initialProjects);
  const [proposals, setProposals] = useState<Proposal[]>(initialProposals);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isProposalFormOpen, setIsProposalFormOpen] = useState(false);
  const [selectedProjectForProposal, setSelectedProjectForProposal] = useState<Project | null>(null);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState<string | null>(null);

  // Mock current admin user
  const currentUser = {
    id: '2',
    name: 'Admin User',
    role: 'ADMIN' as const
  };

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

  const stats = {
    totalProjects: projects.length,
    activeProposals: proposals.filter(p => p.status === 'PENDING').length,
    acceptedProposals: proposals.filter(p => p.status === 'ACCEPTED').length,
    totalRevenue: proposals.filter(p => p.status === 'ACCEPTED').reduce((sum, p) => sum + p.proposedBudget, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentUser={currentUser} />
      
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
        </div>

        {/* Available Projects */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <Briefcase size={20} />
              <span>Available Projects</span>
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div key={project.id} className="relative">
                  <ProjectCard
                    project={project}
                    showActions={true}
                    onViewMessages={handleViewMessages}
                  />
                  <div className="mt-4 flex space-x-2">
                    <button
                      onClick={() => handleProposeForProject(project)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                      disabled={proposals.some(p => p.projectId === project.id)}
                    >
                      {proposals.some(p => p.projectId === project.id) ? 'Proposal Sent' : 'Send Proposal'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* My Proposals */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <FileText size={20} />
              <span>My Proposals</span>
            </h2>
          </div>
          
          <div className="p-6">
            {proposals.length > 0 ? (
              <div className="space-y-4">
                {proposals.map((proposal) => {
                  const project = projects.find(p => p.id === proposal.projectId);
                  const getStatusColor = (status: Proposal['status']) => {
                    switch (status) {
                      case 'PENDING':
                        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                      case 'ACCEPTED':
                        return 'bg-green-100 text-green-800 border-green-200';
                      case 'REJECTED':
                        return 'bg-red-100 text-red-800 border-red-200';
                      default:
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                    }
                  };

                  return (
                    <div key={proposal.id} className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                          <p className="text-sm text-gray-600">For: {project?.title}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{proposal.description}</p>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                        <span>Budget: ${proposal.proposedBudget.toLocaleString()}</span>
                        <span>Completion: {new Date(proposal.estimatedCompletion).toLocaleDateString()}</span>
                        <span>Submitted: {new Date(proposal.createdAt).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => handleViewMessages(proposal.projectId)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                      >
                        <MessageSquare size={16} />
                        <span>View Communication</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <p className="text-gray-600">No proposals yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isProposalFormOpen && selectedProjectForProposal && (
        <ProposalForm
          isOpen={isProposalFormOpen}
          onClose={() => {
            setIsProposalFormOpen(false);
            setSelectedProjectForProposal(null);
          }}
          onSubmit={handleCreateProposal}
          projectId={selectedProjectForProposal.id}
          projectTitle={selectedProjectForProposal.title}
        />
      )}

      {selectedProjectForChat && selectedProject && (
        <ChatComponent
          projectId={selectedProjectForChat}
          projectTitle={selectedProject.title}
          messages={messages}
          currentUserId={currentUser.id}
          currentUserRole={currentUser.role}
          onClose={() => setSelectedProjectForChat(null)}
          onSendMessage={handleSendMessage}
        />
      )}
    </div>
  );
}