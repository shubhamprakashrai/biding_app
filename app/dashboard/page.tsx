'use client';

import { useState, useEffect } from 'react';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import ChatComponent from '@/components/ChatComponent';
import { Project, Message, User } from '@/types';
import { Plus, Briefcase, MessageSquare, Clock, ArrowRight, CheckCircle, Zap } from 'lucide-react';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from '@/app/firebase/firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);


  // Load current user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData: User = {
          id: user.uid,
          name: user.displayName || "User",
          email: user.email || "",
          role: "USER"
        };
        setCurrentUser(userData);

        // Fetch user-specific projects from Firestore
        const q = query(collection(db, "projects"), where("userId", "==", user.uid));
        const snap = await getDocs(q);
        const projectsData = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];
        setProjects(projectsData);

        // Optionally fetch messages for these projects
        const messagesSnap = await getDocs(collection(db, "messages"));
        const messagesData = messagesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Message[];
        setMessages(messagesData);

        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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

    setMessages(prev => [...prev, newMessage]);
  };

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 p-10 text-center text-blue-100">Loading...</div>;
  if (!currentUser) return <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 p-10 text-center text-blue-100">Please log in to view the dashboard</div>;

  const userProjects = projects.filter(p => p.userId === currentUser.id);
  const selectedProject = projects.find(p => p.id === selectedProjectForChat);

  const projectStats = {
    total: userProjects.length,
    pending: userProjects.filter(p => p.status === 'PENDING').length,
    inProgress: userProjects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: userProjects.filter(p => p.status === 'COMPLETED').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2">
                Welcome back, {currentUser.name.split(' ')[0]}!
              </h1>
              <p className="text-blue-300/80 flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>Last updated: {new Date().toLocaleDateString()}</span>
              </p>
            </div>
            <button
              onClick={() => setIsProjectFormOpen(true)}
              className="group relative inline-flex items-center justify-center px-6 py-3 overflow-hidden font-medium text-white bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 hover:-translate-y-0.5 border border-cyan-400/30 hover:border-cyan-300/50"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus size={20} className="mr-2 group-hover:rotate-90 transition-transform duration-300 relative z-10" />
              <span className="font-medium relative z-10">New App</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {['total','pending','inProgress','completed'].map((key) => {
              const titleMap: any = { total: "Total Projects", pending: "Pending", inProgress: "In Progress", completed: "Completed" };
              const countMap: any = { total: projectStats.total, pending: projectStats.pending, inProgress: projectStats.inProgress, completed: projectStats.completed };
              const iconMap: any = { total: <Briefcase size={20} />, pending: <Clock size={20} />, inProgress: <Zap size={20} />, completed: <CheckCircle size={20} /> };
              return (
                <div key={key} className="bg-blue-900/40 backdrop-blur-sm p-6 rounded-xl border border-blue-800/50 hover:border-cyan-400/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.1)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-300/80 mb-1">{titleMap[key]}</p>
                      <p className="text-2xl font-bold text-white">{countMap[key]}</p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      key === 'total' ? 'bg-blue-800/50 text-cyan-400' : 
                      key === 'pending' ? 'bg-amber-500/10 text-amber-400' :
                      key === 'inProgress' ? 'bg-cyan-500/10 text-cyan-400' :
                      'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {iconMap[key]}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Project List */}
          <div className="bg-blue-900/30 backdrop-blur-sm rounded-xl border border-blue-800/50 mb-8 overflow-hidden transform transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,211,238,0.1)]">
            <div className="p-6 border-b border-blue-800/50 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Briefcase size={20} className="text-cyan-400" />
                <span>My Projects</span>
              </h2>
              <div className="text-sm text-blue-300/80">
                Showing {userProjects.length} of {userProjects.length} projects
              </div>
            </div>
            <div className="p-6">
              {userProjects.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {userProjects.map(project => (
                    <ProjectCard 
                    key={project.id} 
                    project={project} 
                    showActions 
                    onEdit={handleEditProject} 
                    onViewMessages={handleViewMessages} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="mx-auto w-20 h-20 bg-blue-800/30 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-cyan-500/30">
                    <Briefcase className="h-10 w-10 text-cyan-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Projects Yet</h3>
                  <p className="text-blue-300/80 mb-6 max-w-md mx-auto">
                    Get started by creating your first project. Track your progress and manage everything in one place.
                  </p>
                  <button
                    onClick={() => setIsProjectFormOpen(true)}
                    className="inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    <Plus size={20} className="mr-2" /> New Project
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
  project={editingProject}   // ✅ pass the selected project when editing
  onSubmit={(updatedProject) => {
    if (editingProject) {
      // update existing
      setProjects(prev =>
        prev.map(p => (p.id === updatedProject.id ? updatedProject : p))
      );
    } else {
      // add new
      setProjects(prev => [updatedProject, ...prev]);
    }
    setEditingProject(null);
  }}
/>

    </div>
  );
}
