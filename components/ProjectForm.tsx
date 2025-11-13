'use client';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { X, Plus, Upload, Trash2, Copy } from 'lucide-react';
import { auth, db, storage } from '@/app/firebase/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { Project } from '@/types';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  onSubmit?: (projectData: Project) => void;
}

export default function ProjectForm({ isOpen, onClose, project, onSubmit }: ProjectFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'access' | 'vps'>('info');

  // access/vps extra fields
  const [accessEmail, setAccessEmail] = useState('');
  const [accessLink, setAccessLink] = useState('');
  const [vpsEmail, setVpsEmail] = useState('');
  const [vpsPassword, setVpsPassword] = useState('');

  const handleCopy = (text: string) => {
    if (!text) return alert('Nothing to copy');
    navigator.clipboard.writeText(text);
    alert('Copied!');
  };

  const [formData, setFormData] = useState<Omit<Project, 'id' | 'userId' | 'attachments' | 'status' | 'createdAt'>>({
    title: '',
    description: '',
    features: '',
    budget: 0,
    timeline: 0,
    contactName: '',
    email: '',
    phone: '',
    whatsapp: '',
    aliasName: '',
    password: '',
    appLink: '',
    playStoreLink: '',
    type: 'app',
    accessEmail: '',
    accessLink: '',
    vpsEmail: '',
    vpsPassword: '',
  });


  

  useEffect(() => {
    if (project) {
      // Set the active tab based on project type
      if (project.type === 'access') {
        setActiveTab('access');
      } else if (project.type === 'vps') {
        setActiveTab('vps');
      } else {
        setActiveTab('info');
      }

      setFormData({
        title: project.title || '',
        description: project.description || '',
        features: project.features || '',
        budget: project.budget ?? 0,
        timeline: project.timeline ? Number(project.timeline) : 0,
        contactName: project.contactName || '',
        email: project.email || '',
        phone: project.phone || '',
        whatsapp: project.whatsapp || '',
        aliasName: project.aliasName || '',
        password: project.password || '',
        appLink: project.appLink || '',
        playStoreLink: project.playStoreLink || '',
        type: project.type || 'app',
        accessEmail: project.accessEmail || '',
        accessLink: project.accessLink || '',
        vpsEmail: project.vpsEmail || '',
        vpsPassword: project.vpsPassword || '',
      });
    } else {
      // Reset to default tab and form when creating a new project
      setActiveTab('info');
      setFormData({
        title: '',
        description: '',
        features: '',
        budget: 0,
        timeline: 0,
        contactName: '',
        email: '',
        phone: '',
        whatsapp: '',
        aliasName: '',
        password: '',
        appLink: '',
        playStoreLink: '',
        type: 'app',
        accessEmail: '',
        accessLink: '',
        vpsEmail: '',
        vpsPassword: '',
      });
      setFiles([]);
    }
  }, [project, isOpen]);


  





  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const resetForm = () => {
    // Only reset the form if we're not editing an existing project
    if (!project) {
      setFormData({
        title: '',
        description: '',
        features: '',
        budget: 0,
        timeline: 0,
        contactName: '',
        email: '',
        phone: '',
        whatsapp: '',
        aliasName: '',
        password: '',
        appLink: '',
        playStoreLink: '',
        type: 'app',
        accessEmail: '',
        accessLink: '',
        vpsEmail: '',
        vpsPassword: '',
      });
      setFiles([]);
    }
  };

  const handleTabChange = (tab: 'info' | 'access' | 'vps') => {
    // Only reset form if we're not editing an existing project
    if (!project) {
      resetForm();
    }
    setActiveTab(tab);
    // Set the project type based on the tab
    setFormData(prev => ({
      ...prev,
      type: tab === 'info' ? 'app' : tab === 'access' ? 'access' : 'vps'
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'budget' || name === 'timeline' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        alert('Login first!');
        return;
      }

      const uploadedFiles: string[] = [];
      for (const file of files) {
        const storageRef = ref(storage, `projects/${Date.now()}-${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        const url: string = await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            () => {},
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            }
          );
        });
        uploadedFiles.push(url);
      }

      // Create a base project data object with common fields
      const baseProjectData: Partial<Project> = {
        ...formData,
        userId: user.uid,
        attachments: uploadedFiles.length ? uploadedFiles : project?.attachments || [],
        status: project?.status || 'PENDING',
        createdAt: project?.createdAt || new Date().toISOString(),
      };

      // Create a type-specific project data object based on the active tab
      let projectData: Project;
      
      if (activeTab === 'access') {
        projectData = {
          ...baseProjectData,
          type: 'access',
          accessEmail: formData.accessEmail,
          accessLink: formData.accessLink,
          // Clear VPS fields
          vpsEmail: '',
          vpsPassword: ''
        } as Project;
      } else if (activeTab === 'vps') {
        projectData = {
          ...baseProjectData,
          type: 'vps',
          vpsEmail: formData.vpsEmail,
          vpsPassword: formData.vpsPassword,
          // Clear access fields
          accessEmail: '',
          accessLink: ''
        } as Project;
      } else {
        // Default to 'app' type for the info tab
        projectData = {
          ...baseProjectData,
          type: 'app',
          // Clear both access and VPS fields
          accessEmail: '',
          accessLink: '',
          vpsEmail: '',
          vpsPassword: ''
        } as Project;
      }

      // Add the ID to the project data
      projectData.id = project?.id || '';

      if (project) {
        await setDoc(doc(db, 'projects', project.id), projectData);
        onSubmit?.({ ...projectData, id: project.id });
      } else {
        const docRef = doc(collection(db, 'projects'));
        const projectDataWithId: Project = { ...projectData, id: docRef.id };
        await setDoc(docRef, projectDataWithId);
        onSubmit?.(projectDataWithId);
      }

      onClose();
    } catch (error: any) {
      console.error('Error uploading project:', error);
      alert(`Upload failed: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Manage Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex border-b border-gray-200">
          {['info', 'access', 'vps'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab as any)}
              className={`flex-1 py-3 font-medium ${
                activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'
              }`}
            >
              {tab === 'info' && 'App Info'}
              {tab === 'access' && 'Provide Access'}
              {tab === 'vps' && 'Direct VPS'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* === TAB 1: App Info === */}
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Entire original form */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  App Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Enter project title..."
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  App Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Describe your project requirements..."
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (PDF, Images, jks)
                </label>
                <input
                  ref={fileInputRef}
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png,.jks,.doc,.docx,"
                  className="w-full text-sm"
                />
                {files.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <Upload className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-700 truncate max-w-xs">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alias Name</label>
                  <input
                    type="text"
                    name="aliasName"
                    value={formData.aliasName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="text"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">App Link *</label>
                <input
                  type="url"
                  name="appLink"
                  value={formData.appLink}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="https://yourapp.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Play Store Link *
                </label>
                <input
                  type="url"
                  name="playStoreLink"
                  value={formData.playStoreLink}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="https://play.google.com/store/apps/details?id=..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Whatsapp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus size={20} />{' '}
                  <span>{loading ? 'Submitting...' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          )}

          {/* ++++++. === TAB 2: Provide Access === ++++++++*/}
          {activeTab === 'access' && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Provide Access</h3>

                <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  App Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Enter project title..."
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  App Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Describe your project requirements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={accessEmail}
                  onChange={(e) => setAccessEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Enter collaborator email..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Shareable Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={accessLink}
                    onChange={(e) => setAccessLink(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md"
                    placeholder="https://yourapp.com/project/..."
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(accessLink)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                  >
                    <Copy size={16} className="mr-1" /> Copy
                  </button>
                </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Whatsapp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus size={20} />{' '}
                  <span>{loading ? 'Submitting...' : 'Create Project'}</span>
                </button>
              </div>
            </div>
            </form>
          )}

          {/* === TAB 3: Direct VPS === */}
          {activeTab === 'vps' && (
            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg text-gray-800">Provide Direct VPS</h3>
                <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  App Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Enter project title..."
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  App Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  placeholder="Describe your project requirements..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VPS Email</label>
                <div className="flex gap-2">

                  
                  <input
                    type="email"
                    value={vpsEmail}
                    onChange={(e) => setVpsEmail(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md"
                    placeholder="vps@example.com"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(vpsEmail)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                  >
                    <Copy size={16} className="mr-1" /> Copy
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">VPS Password</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={vpsPassword}
                    onChange={(e) => setVpsPassword(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md"
                    placeholder="Enter VPS password..."
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(vpsPassword)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center"
                  >
                    <Copy size={16} className="mr-1" /> Copy
                  </button>
                </div>
              </div>


              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Whatsapp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-2"
                >
                  <Plus size={20} />{' '}
                  <span>{loading ? 'Submitting...' : 'Create Project'}</span>
                </button>
              </div>
            </div>
          </form>
          )}
        </div>
      </div>
    </div>
  );
}
