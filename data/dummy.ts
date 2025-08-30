import { User, Project, Proposal, Message } from '@/types';

export const users: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER'
  },
  {
    id: '2',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'ADMIN'
  }
];

export const projects: Project[]   = [];

export const proposals: Proposal[] = [
  {
    id: '1',
    projectId: '1',
    adminId: '2',
    title: 'Complete E-commerce Solution',
    description: 'I can deliver a full-featured e-commerce platform using Next.js and Stripe integration.',
    proposedBudget: 4800,
    estimatedCompletion: '2025-03-10',
    status: 'ACCEPTED',
    createdAt: '2025-01-11T16:00:00Z'
  },
  {
    id: '2',
    projectId: '2',
    adminId: '2',
    title: 'Mobile App Design Package',
    description: 'Complete UI/UX design including wireframes, prototypes, and final designs.',
    proposedBudget: 2800,
    estimatedCompletion: '2025-02-25',
    status: 'PENDING',
    createdAt: '2025-01-13T11:00:00Z'
  }
];

export const messages: Message[] = [
  {
    id: '1',
    projectId: '1',
    senderId: '1',
    senderName: 'John Doe',
    senderRole: 'USER',
    content: 'Hi, I\'m excited to start this project. When can we begin?',
    timestamp: '2025-01-11T17:00:00Z'
  },
  {
    id: '2',
    projectId: '1',
    senderId: '2',
    senderName: 'Admin User',
    senderRole: 'ADMIN',
    content: 'Hello John! I can start immediately. Let me prepare the project timeline and send you the initial requirements.',
    timestamp: '2025-01-11T17:15:00Z'
  },
  {
    id: '3',
    projectId: '1',
    senderId: '1',
    senderName: 'John Doe',
    senderRole: 'USER',
    content: 'That sounds perfect. Do you need any additional information from me?',
    timestamp: '2025-01-11T17:30:00Z'
  },
  {
    id: '4',
    projectId: '1',
    senderId: '2',
    senderName: 'Admin User',
    senderRole: 'ADMIN',
    content: 'I\'ll need access to your current product catalog and brand guidelines. Can you share those?',
    timestamp: '2025-01-11T18:00:00Z'
  }
];