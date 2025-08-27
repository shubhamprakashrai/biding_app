export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  userId: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  projectId: string;
  adminId: string;
  title: string;
  description: string;
  proposedBudget: number;
  estimatedCompletion: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  senderName: string;
  senderRole: 'USER' | 'ADMIN';
  content: string;
  timestamp: string;
}