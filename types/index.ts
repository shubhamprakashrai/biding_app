export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface ProjectFile {
  url: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: any; // Firestore Timestamp or string
}

export interface PaymentInfo {
  screenshot?: string;
  verified?: boolean;
  verifiedAt?: any; // Firestore Timestamp or string
  verifiedBy?: string;
  transactionId?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline?: string;
  timeline: string | number;
  status: 'PENDING' | 'IN_PROGRESS' | 'PAYMENT_PROCESSING' | 'PAYMENT_COMPLETED' | 'PAYMENT_UNDER_REVIEW' | 'COMPLETED' | 'CANCELLED';
  userId: string;
  createdAt: string;
  updatedAt?: any; // Firestore Timestamp or string
  email: string;
  phone: string;
  whatsapp: string;
  attachments?: string[];
  features?: string;
  contactName: string;
  paymentQrCode?: string;
  payment?: PaymentInfo;
  paymentProof?: string;
  transactionId?: string;
  
  payments?: Array<{
    id: string;
    amount: number;
    status: string;
    screenshot: string;
    transactionId: string;
    submittedAt: any; // Firestore Timestamp or string
    reviewedAt?: any; // Firestore Timestamp or string
  }>;
  aliasName?: string;
  password?: string;
  appLink?: string;
  playStoreLink?: string;
  apkFile?: ProjectFile;
  zipFile?: ProjectFile;
  deliverables?: Array<{
    fileName: string;
    type: "apk" | "zip" | "code";
    uploadedAt: any;
    url: string;
  }>;
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