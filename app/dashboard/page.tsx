'use client';

import { useState, useEffect, useMemo } from 'react';
import { ProjectCard, ProjectForm, ProjectFilter } from '@/components/projects';
import { Project, Message, User } from '@/types';
import { Plus, Briefcase, Clock, CheckCircle, Zap } from 'lucide-react';
import { useProjectsViewModel } from '@/viewmodels/ProjectsViewModel';
import { useProjectFilterViewModel } from '@/viewmodels/ProjectFilterViewModel';
import { authService } from '@/services/firebase/AuthService';

export default function DashboardPage() {
  // Use global projects store
  const {
    userProjects,
    messages,
    isLoading,
    isInitialized,
    initializeUserProjects,
    addMessage,
    addProject,
    updateProject
  } = useProjectsViewModel();

  // Use filter store
  const { filters, applyFilters, getActiveFilterCount } = useProjectFilterViewModel();

  // Apply filters to user projects - include filters in dependency to trigger re-render on filter change
  const filteredProjects = useMemo(() => {
    return applyFilters(userProjects);
  }, [userProjects, filters, applyFilters]);

  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Load current user and initialize projects
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (user) => {
      if (user) {
        const userData: User = {
          id: user.uid,
          name: user.displayName || "User",
          email: user.email || "",
          role: "USER"
        };
        setCurrentUser(userData);

        // Initialize user projects from global store (cached)
        initializeUserProjects(user.uid);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [initializeUserProjects]);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectFormOpen(true);
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

    addMessage(newMessage);
  };

  // Show loading only on initial load
  if (authLoading || (isLoading && !isInitialized)) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  if (!currentUser) {
    return <div className="p-10 text-center">User not logged in</div>;
  }

  const selectedProject = userProjects.find(p => p.id === selectedProjectForChat);

  const activeFilterCount = getActiveFilterCount();

  const projectStats = {
    total: userProjects.length,
    filtered: filteredProjects.length,
    pending: userProjects.filter(p => p.status === 'PENDING').length,
    inProgress: userProjects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: userProjects.filter(p => p.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
              Welcome back, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-gray-500 flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>Last updated: {new Date().toLocaleDateString()}</span>
            </p>
          </div>
          <button
            onClick={() => setIsProjectFormOpen(true)}
            className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:shadow-lg hover:shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5"
          >
            <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">New App</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {['total','pending','inProgress','completed'].map((key) => {
            const titleMap: any = { total: "Total Projects", pending: "Pending", inProgress: "In Progress", completed: "Completed" };
            const countMap: any = { total: projectStats.total, pending: projectStats.pending, inProgress: projectStats.inProgress, completed: projectStats.completed };
            const iconMap: any = { total: <Briefcase size={20} />, pending: <Clock size={20} />, inProgress: <Zap size={20} />, completed: <CheckCircle size={20} /> };
            return (
              <div key={key} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{titleMap[key]}</p>
                    <p className="text-2xl font-bold text-gray-800">{countMap[key]}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                    {iconMap[key]}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Project Filters - Hide email filter for regular users since they only see their own projects */}
        <ProjectFilter showEmailFilter={false} />

        {/* Project List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-md">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center space-x-2">
              <Briefcase size={20} className="text-emerald-600" />
              <span>My Apps</span>
            </h2>
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium text-gray-700">{projectStats.filtered}</span> of{' '}
              <span className="font-medium text-gray-700">{projectStats.total}</span> {projectStats.total > 1 ? 'apps' : 'app'}
              {activeFilterCount > 0 && (
                <span className="ml-2 text-emerald-600">({activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} applied)</span>
              )}
            </div>
          </div>
          <div className="p-6">
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    showActions
                    onEdit={handleEditProject}
                    onViewMessages={handleViewMessages}
                  />
                ))}
              </div>
            ) : userProjects.length > 0 ? (
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No apps match your filters</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <div className="mx-auto w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
                  <Briefcase className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Apps yet</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Get started by creating your first app</p>
                <button
                  onClick={() => setIsProjectFormOpen(true)}
                  className="inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Plus size={20} className="mr-2" /> Create App
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Modals */}
      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => {
          setIsProjectFormOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
        onSubmit={(updatedProject) => {
          if (editingProject) {
            updateProject(updatedProject);
          } else {
            addProject(updatedProject);
          }
          setEditingProject(null);
        }}
      />

    </div>
  );
}
