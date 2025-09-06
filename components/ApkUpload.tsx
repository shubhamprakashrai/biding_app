'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { storage } from '@/app/firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface ApkUploadProps {
  projectId: string;
  currentApkUrl?: string;
  onUploadSuccess: (url: string) => void;
  onDelete?: () => void;
}

export default function ApkUpload({ projectId, currentApkUrl, onUploadSuccess, onDelete }: ApkUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is APK or ZIP
    const validExtensions = ['.apk', '.zip'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Please upload a valid .apk or .zip file');
      return;
    }

    setIsUploading(true);
    setError('');
    
    try {
      const storageRef = ref(storage, `apks/${projectId}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          // Track upload progress
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload failed:', error);
          setError('Failed to upload APK. Please try again.');
          setIsUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onUploadSuccess(downloadURL);
          setIsUploading(false);
          setProgress(0);
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('An error occurred during upload');
      setIsUploading(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) onDelete();
  };

  if (currentApkUrl) {
    return (
      <div className="mt-2 p-3 border border-green-200 bg-green-50 rounded-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-green-700">APK File Uploaded</span>
            <a 
              href={currentApkUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 text-blue-600 text-sm hover:underline"
            >
              Download APK
            </a>
          </div>
          {onDelete && (
            <button 
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700"
              disabled={isUploading}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <label className="flex flex-col items-center px-4 py-6 bg-white text-blue-500 rounded-lg border border-dashed border-blue-300 cursor-pointer hover:bg-blue-50">
        <Upload className="w-6 h-6 mb-2" />
        <span className="text-sm font-medium">
          {isUploading ? 'Uploading...' : 'Upload APK File'}
        </span>
        <input 
          type="file" 
          className="hidden" 
          accept=".apk,.zip"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </label>
      
      {isUploading && (
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      <p className="mt-1 text-xs text-gray-500">
        Only .apk or .zip files are accepted. Max size: 100MB
      </p>
    </div>
  );
}
