// 'use client';

// import { useState, useRef, ChangeEvent } from 'react';
// import { X, Plus, Upload, Trash2 } from 'lucide-react';

// interface ProjectFormProps {
//   isOpen: boolean;
//   onClose: () => void;
//   onSubmit: (project: any) => void;
// }

// export default function ProjectForm({ isOpen, onClose, onSubmit }: ProjectFormProps) {
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const [files, setFiles] = useState<File[]>([]);
//   const [formData, setFormData] = useState({
//     title: '',
//     description: '',
//     features: '',
//     budget: '',
//     timeline: '',
//     contactName: '',
//     email: '',
//     phone: ''
//   });
  
//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const newFiles = Array.from(e.target.files);
//       setFiles(prev => [...prev, ...newFiles]);
//     }
//   };
  
//   const removeFile = (index: number) => {
//     setFiles(prev => prev.filter((_, i) => i !== index));
//   };
  
//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
    
//     // Basic validation
//     if (files.length === 0) {
//       if (!confirm('Are you sure you want to submit without any attachments?')) {
//         return;
//       }
//     }
    
//     const formDataToSubmit = new FormData();
    
//     // Append form data
//     Object.entries(formData).forEach(([key, value]) => {
//       if (Array.isArray(value)) {
//         value.forEach(item => formDataToSubmit.append(key, item));
//       } else {
//         formDataToSubmit.append(key, value);
//       }
//     });
    
//     // Append files
//     files.forEach((file, index) => {
//       formDataToSubmit.append(`file-${index}`, file);
//     });
    
//     onSubmit({
//       ...formData,
//       budget: parseFloat(formData.budget),
//       id: Date.now().toString(),
//       status: 'PENDING',
//       files: files.map(file => file.name),
//       createdAt: new Date().toISOString(),
//     });
    
//     // Reset form
//     setFormData({
//       title: '',
//       description: '',
//       features: '',
//       budget: '',
//       timeline: '',
//       contactName: '',
//       email: '',
//       phone: ''
//     });
//     setFiles([]);
//     onClose();
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

  

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="flex justify-between items-center p-6 border-b border-gray-200">
//           <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div>
//             <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
//               Project Title *
//             </label>
//             <input
//               type="text"
//               id="title"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               required
//               className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//               placeholder="Enter project title..."
//             />
//           </div>

//           <div>
//             <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
//               Project Description *
//             </label>
//             <textarea
//               id="description"
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               required
//               rows={4}
//               className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
//               placeholder="Describe your project requirements, goals, and any specific details..."
//             />
//           </div>

//           <div className="space-y-6">
//             <div>
//               <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-2">
//                 Features & Requirements
//               </label>
//               <textarea
//                 id="features"
//                 name="features"
//                 value={formData.features}
//                 onChange={handleChange}
//                 rows={4}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
//                 placeholder="List the key features and requirements for your project..."
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
//                   Budget (USD) *
//                 </label>
//                 <div className="relative rounded-md shadow-sm">
//                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                     <span className="text-gray-500 sm:text-sm">$</span>
//                   </div>
//                   <input
//                     type="number"
//                     id="budget"
//                     name="budget"
//                     value={formData.budget}
//                     onChange={handleChange}
//                     required
//                     min="0"
//                     step="0.01"
//                     className="w-full pl-7 pr-12 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                     placeholder="5000"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
//                   Timeline (weeks) *
//                 </label>
//                 <input
//                   type="number"
//                   id="timeline"
//                   name="timeline"
//                   value={formData.timeline}
//                   onChange={handleChange}
//                   required
//                   min="1"
//                   className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                   placeholder="e.g., 8"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Attachments (PDF, Images)
//               </label>
//               <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
//                 <div className="space-y-1 text-center">
//                   <div className="flex text-sm text-gray-600 justify-center">
//                     <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
//                       <span>Upload files</span>
//                       <input
//                         ref={fileInputRef}
//                         id="file-upload"
//                         name="file-upload"
//                         type="file"
//                         className="sr-only"
//                         multiple
//                         onChange={handleFileChange}
//                         accept=".pdf,.jpg,.jpeg,.png"
//                       />
//                     </label>
//                     <p className="pl-1">or drag and drop</p>
//                   </div>
//                   <p className="text-xs text-gray-500">
//                     PDF, JPG, PNG up to 10MB
//                   </p>
//                 </div>
//               </div>
              
//               {files.length > 0 && (
//                 <div className="mt-2 space-y-2">
//                   {files.map((file, index) => (
//                     <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
//                       <div className="flex items-center space-x-2">
//                         <Upload className="h-4 w-4 text-gray-500" />
//                         <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
//                         <span className="text-xs text-gray-500">
//                           {(file.size / 1024).toFixed(1)} KB
//                         </span>
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeFile(index)}
//                         className="text-red-500 hover:text-red-700"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
//                   Contact Name *
//                 </label>
//                 <input
//                   type="text"
//                   id="contactName"
//                   name="contactName"
//                   value={formData.contactName}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                   placeholder="Your name"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                   Email *
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                   placeholder="your.email@example.com"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
//                   Phone Number *
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   value={formData.phone}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
//                   placeholder="+1 (555) 123-4567"
//                   pattern="[0-9+\-\s()]{10,}"
//                 />
//               </div>

//             </div>
//           </div>

//           <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center space-x-2"
//             >
//               <Plus size={20} />
//               <span>Create Project</span>
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }


'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { X, Plus, Upload, Trash2 } from 'lucide-react';
import { auth, db, storage } from '@/app/firebase/firebase'; 
import { doc, setDoc } from 'firebase/firestore';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ProjectFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectForm({ isOpen, onClose }: ProjectFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    features: '',
    budget: '',
    timeline: '',
    contactName: '',
    email: '',
    phone: ''
  });
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Upload attachments if any
    const uploadedFiles: string[] = [];
    for (const file of files) {
      const storageRef = ref(storage, `projects/${file.name}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      uploadedFiles.push(url);
    }

    // Save project to Firestore
    await addDoc(collection(db, "projects"), {
      ...formData,
      attachments: uploadedFiles,
      createdAt: serverTimestamp(),
    });

    console.log("✅ Project saved to Firestore");
    onClose(); // close modal
  } catch (error) {
    console.error("Error submitting project:", error);
  } finally {
    setLoading(false);
  }
};
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Project Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Enter project title..."
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              placeholder="Describe your project requirements..."
            />
          </div>

          {/* Features */}
          <div>
            <label htmlFor="features" className="block text-sm font-medium text-gray-700 mb-2">
              Features & Requirements
            </label>
            <textarea
              id="features"
              name="features"
              value={formData.features}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
              placeholder="List the key features..."
            />
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget (USD) *
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="5000"
              />
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                Timeline (weeks) *
              </label>
              <input
                type="number"
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
                placeholder="e.g., 8"
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (PDF, Images)
            </label>
            <input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full text-sm"
            />

            {files.length > 0 && (
              <div className="mt-2 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center space-x-2">
                      <Upload className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-700 truncate max-w-xs">{file.name}</span>
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

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Name *
              </label>
              <input
                type="text"
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          {/* Buttons */}
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
              <Plus size={20} />
              <span>{loading ? 'Submitting...' : 'Create Project'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
