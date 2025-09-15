'use client';

import { useState, useEffect } from 'react';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import ChatComponent from '@/components/ChatComponent';
import { Project, Message, User } from '@/types';
import { Plus, Briefcase, MessageSquare, Clock, ArrowRight, CheckCircle, Zap, Users, FileText, Image as ImageIcon } from 'lucide-react';
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from '@/app/firebase/firebase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Button } from '@/components/ui/button';

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

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-10 text-center text-gray-700">Loading...</div>;
  if (!currentUser) return <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-10 text-center text-gray-700">Please log in to view the dashboard</div>;

  const userProjects = projects.filter(p => p.userId === currentUser.id);
  const selectedProject = projects.find(p => p.id === selectedProjectForChat);

  const projectStats = {
    total: userProjects.length,
    pending: userProjects.filter(p => p.status === 'PENDING').length,
    inProgress: userProjects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: userProjects.filter(p => p.status === 'COMPLETED').length,
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#4f8efc]/10 rounded-full filter blur-3xl animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#4f8efc]/5 rounded-full filter blur-3xl animate-float animation-delay-2000"></div>
        <div className="absolute top-1/2 -right-20 w-64 h-64 bg-[#4f8efc]/10 rounded-full filter blur-3xl animate-float animation-delay-4000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
              Welcome back, {currentUser.name}!
            </h1>
            <p className="text-gray-500">Here's what's happening with your projects</p>
          </div>
          <Button
            onClick={() => {
              setEditingProject(null);
              setIsProjectFormOpen(true);
            }}
            className="flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            <Plus size={16} />
            New Project
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Projects</p>
                <h3 className="text-2xl font-semibold text-gray-800 mt-1">{projectStats.total}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <h3 className="text-2xl font-semibold text-amber-600 mt-1">{projectStats.pending}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-50">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <h3 className="text-2xl font-semibold text-blue-600 mt-1">{projectStats.inProgress}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-blue-50">
                <Zap className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <h3 className="text-2xl font-semibold text-emerald-600 mt-1">{projectStats.completed}</h3>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Project List */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold text-gray-800">My Projects</h2>
            <p className="text-sm text-gray-500">Showing {userProjects.length} of {userProjects.length} projects</p>
          </div>
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
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Get started by creating your first project. Track your progress and manage everything in one place.
              </p>
              <Button
                onClick={() => {
                  setEditingProject(null);
                  setIsProjectFormOpen(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 text-sm"
              >
                <Plus size={16} />
                New Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Project Form Modal */}
      {/* Project Form Modal */}
      <ProjectForm
        isOpen={isProjectFormOpen}
        onClose={() => {
          setIsProjectFormOpen(false);
          setEditingProject(null);
        }}
        onSubmit={(projectData) => {
          // Handle form submission
          setIsProjectFormOpen(false);
        }}
        project={editingProject}
      />

      {/* Animated background styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        .animate-float {
          animation: float 10s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
