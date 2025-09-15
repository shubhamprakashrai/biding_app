'use client';

import { useEffect, useState } from 'react';
import ProjectCard from '@/components/ProjectCard';
import { projects as initialProjects, proposals as initialProposals, messages as initialMessages } from '@/data/dummy';
import { Project, Proposal, Message } from '@/types';
import { Users, Briefcase, FileText, MessageSquare, DollarSign, Image as ImageIcon } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import QrUpload from '@/components/QrUpload';
import QrCodeDropdown from '@/components/QrCodeDropdown';

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
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


  // 🔹 Load projects in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "projects"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
  
      // 🔹 Print only projects in console
      console.log("Projects:", data);
    });
    return () => unsub();
  }, []);
  

  

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
      // The onSnapshot listener will automatically update the UI
    } catch (error) {
      console.error('Error updating project status:', error);
      // You might want to show an error toast here
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

  const stats = {
    totalProjects: projects.length,
    activeProposals: proposals.filter(p => p.status === 'PENDING').length,
    acceptedProposals: proposals.filter(p => p.status === 'ACCEPTED').length,
    totalRevenue: proposals.filter(p => p.status === 'ACCEPTED').reduce((sum, p) => sum + p.proposedBudget, 0)
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#4f8efc]/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#4f8efc]/5 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 -right-20 w-64 h-64 bg-[#4f8efc]/10 rounded-full filter blur-3xl animate-float animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center mb-4 px-6 py-2 bg-white/90 backdrop-blur-sm rounded-full border border-gray-200 text-[#4f8efc] text-sm font-semibold tracking-wide shadow-lg shadow-gray-100/50">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4f8efc] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4f8efc]"></span>
            </span>
            ADMIN DASHBOARD
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Project Management</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">Efficiently manage projects, review proposals, and track progress</p>
        </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalProjects}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#4f8efc]/10">
              <Briefcase className="text-[#4f8efc]" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Active Proposals</p>
              <p className="text-3xl font-bold text-amber-500">{stats.activeProposals}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10">
              <FileText className="text-amber-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Accepted</p>
              <p className="text-3xl font-bold text-emerald-500">{stats.acceptedProposals}</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10">
              <Users className="text-emerald-500" size={24} />
            </div>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Revenue</p>
              <p className="text-3xl font-bold text-purple-500">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-500/10">
              <DollarSign className="text-purple-500" size={24} />
            </div>
          </div>
        </div>

        {/* QR Code Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl border border-gray-200 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">QR Code Management</h3>
                <p className="text-gray-500 mt-1">Upload and manage your QR codes</p>
              </div>
              <div className="p-3 rounded-xl bg-[#4f8efc]/10">
                <ImageIcon className="text-[#4f8efc]" size={24} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-800">Upload New QR Code</h4>
                  <div className="p-2.5 rounded-xl bg-indigo-500/10">
                    <ImageIcon className="text-indigo-500" size={20} />
                  </div>
                </div>
                <QrUpload onUploadSuccess={() => setQrRefreshTrigger(prev => prev + 1)} />
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center justify-between mb-5">
                  <h4 className="text-lg font-semibold text-gray-800">Manage QR Codes</h4>
                  <div className="p-2.5 rounded-xl bg-green-500/10">
                    <ImageIcon className="text-green-500" size={20} />
                  </div>
                </div>
                <QrCodeDropdown key={qrRefreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Section */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-3">
                <Briefcase className="text-[#4f8efc]" size={24} />
                <span>Available Projects</span>
              </h2>
              <p className="text-gray-500 mt-1">Manage and track all your active projects</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2.5 w-full sm:w-64 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#4f8efc]/50 focus:border-[#4f8efc] text-gray-700 placeholder-gray-400 text-sm"
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <ProjectCard
                  project={project}
                  showActions={true}
                  isAdmin={currentUser.role === 'ADMIN'}
                  onViewMessages={handleViewMessages}
                  onStatusChange={handleStatusChange}
                  onEdit={(project) => {
                    // Handle edit if needed
                    console.log('Edit project:', project);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>);
}