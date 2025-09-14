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

  return (<div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 p-4">
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-blue-200/80">Manage projects, proposals, and client communications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-900/30 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Total Projects</p>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
            </div>
            <div className="p-2 rounded-full bg-cyan-500/20">
              <Briefcase className="text-cyan-300" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Active Proposals</p>
              <p className="text-2xl font-bold text-amber-300">{stats.activeProposals}</p>
            </div>
            <div className="p-2 rounded-full bg-amber-500/20">
              <FileText className="text-amber-300" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Accepted</p>
              <p className="text-2xl font-bold text-emerald-300">{stats.acceptedProposals}</p>
            </div>
            <div className="p-2 rounded-full bg-emerald-500/20">
              <Users className="text-emerald-300" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-blue-900/30 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-200/80">Revenue</p>
              <p className="text-2xl font-bold text-purple-300">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 rounded-full bg-purple-500/20">
              <DollarSign className="text-purple-300" size={20} />
            </div>
          </div>
        </div>

        {/* QR Code Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-blue-900/30 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-blue-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">QR Code Management</h3>
                <p className="text-sm text-blue-200/80">Upload and manage your QR codes</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-blue-100">Upload New QR Code</h4>
                  <div className="p-2 rounded-full bg-indigo-500/20">
                    <ImageIcon className="text-indigo-300" size={16} />
                  </div>
                </div>
                <QrUpload onUploadSuccess={() => setQrRefreshTrigger(prev => prev + 1)} />
              </div>
              
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-blue-100">Manage QR Codes</h4>
                  <div className="p-2 rounded-full bg-green-500/20">
                    <ImageIcon className="text-green-300" size={16} />
                  </div>
                </div>
                <QrCodeDropdown key={qrRefreshTrigger} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Available Projects */}
      <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl shadow-lg border border-blue-700/50 overflow-hidden">
        <div className="p-6 border-b border-blue-700/50">
          <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Briefcase className="text-cyan-300" size={20} />
            <span>Available App</span>
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="relative">
                <ProjectCard
                  key={project.id}
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