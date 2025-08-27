'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import ChatComponent from '@/components/ChatComponent';
import { projects as initialProjects, messages as initialMessages } from '@/data/dummy';
import { Project, Message, User } from '@/types';
import { Plus, Briefcase, MessageSquare, Clock, ArrowRight, CheckCircle, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Load user from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) setCurrentUser(JSON.parse(userData));
    }
  }, []);

  const handleCreateProject = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
  };

  const handleViewMessages = (projectId: string) => {
    setSelectedProjectForChat(projectId);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedProjectForChat || !currentUser) return;

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
  const userProjects = currentUser ? projects.filter(p => p.userId === currentUser.id) : [];

  const projectStats = {
    total: userProjects.length,
    pending: userProjects.filter(p => p.status === 'PENDING').length,
    inProgress: userProjects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: userProjects.filter(p => p.status === 'COMPLETED').length,
  };

  // If no user, maybe redirect or show placeholder
  if (!currentUser) return <div className="p-10 text-center">Loading user...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-25 to-gray-50">
    <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
            </p>
          </div>
          <button
            onClick={() => setIsProjectFormOpen(true)}
            className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">New Project</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {/* Total */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
                <p className="text-2xl font-bold text-gray-800">{projectStats.total}</p>
                <p className="text-xs text-emerald-600 mt-1 flex items-center">
                  <ArrowRight className="w-3 h-3 mr-1" /> All projects
                </p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <Briefcase size={20} />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Pending</p>
                <p className="text-2xl font-bold text-amber-600">{projectStats.pending}</p>
                <p className="text-xs text-amber-600 mt-1">Awaiting action</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-500">
                <Clock size={20} />
              </div>
            </div>
          </div>

          {/* In Progress */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">In Progress</p>
                <p className="text-2xl font-bold text-amber-600">{projectStats.inProgress}</p>
                <p className="text-xs text-amber-600 mt-1">Active development</p>
              </div>
              <div className="p-3 rounded-lg bg-amber-50 text-amber-500">
                <Zap size={20} className="fill-amber-300" />
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Completed</p>
                <p className="text-2xl font-bold text-emerald-600">{projectStats.completed}</p>
                <p className="text-xs text-emerald-600 mt-1">Successfully delivered</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-500">
                <CheckCircle size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Briefcase size={20} className="text-emerald-600" />
              <span>My Projects</span>
            </h2>
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{userProjects.length}</span> {userProjects.length === 1 ? 'project' : 'projects'}
            </div>
          </div>
          <div className="p-6">
            {userProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {userProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    showActions={true}
                    onViewMessages={handleViewMessages}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first project to organize your work and collaborate with your team.</p>
                <button
                  onClick={() => setIsProjectFormOpen(true)}
                  className="inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Plus size={20} className="mr-2" />
                  <span>Create Project</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Communications */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <MessageSquare size={20} className="text-emerald-600" />
              <span>Recent Communications</span>
            </h2>
          </div>
          <div className="p-6">
            {messages.length > 0 ? (
              messages.slice(0, 3).map((message) => {
                const project = projects.find(p => p.id === message.projectId);
                return (
                  <div key={message.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm font-medium">
                          {message.senderName.charAt(0).toUpperCase()}
                        </div>
                        <h4 className="font-medium text-gray-800">{project?.title}</h4>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3 pl-10">{message.content}</p>
                    <button
                      onClick={() => handleViewMessages(message.projectId)}
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center ml-10 group"
                    >
                      <span>View conversation</span>
                      <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No messages yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">Start a conversation on any project to see messages here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => setIsProjectFormOpen(false)}
        onSubmit={handleCreateProject}
      />

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
