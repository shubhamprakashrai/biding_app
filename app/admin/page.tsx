'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import ProposalForm from '@/components/ProposalForm';
import ChatComponent from '@/components/ChatComponent';
import { projects as initialProjects, proposals as initialProposals, messages as initialMessages } from '@/data/dummy';
import { Project, Proposal, Message } from '@/types';
import { Users, Briefcase, FileText, MessageSquare, DollarSign } from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function AdminPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
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
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
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

    
    </div>
  );
}