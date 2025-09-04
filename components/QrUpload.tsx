'use client';

import { useState, useRef } from "react";
import { db } from "@/app/firebase/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion, setDoc } from "firebase/firestore";
import { Loader2, Upload, X } from "lucide-react";

export default function QrUpload() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Filter out any files that are already selected
    const newFiles = files.filter(file => 
      !selectedFiles.some(existingFile => 
        existingFile.name === file.name && 
        existingFile.size === file.size &&
        existingFile.lastModified === file.lastModified
      )
    );
    
    if (newFiles.length === 0) return;
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    
    // Create preview URLs for new files only
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setLoading(true);

    try {
      console.log('Initializing Firebase Storage...');
      const storage = getStorage();
      const qrUrls: string[] = [];

      console.log(`Starting upload of ${selectedFiles.length} files...`);
      
      // Convert to array of [index, file] pairs to avoid downlevel iteration
      const filesWithIndex = selectedFiles.map((file, index) => [index, file] as const);
      
      for (const [index, file] of filesWithIndex) {
        try {
          console.log(`Uploading file ${index + 1}/${selectedFiles.length}:`, file.name);
          const storagePath = `qr_codes/${Date.now()}-${file.name}`;
          console.log('Storage path:', storagePath);
          
          const storageRef = ref(storage, storagePath);
          console.log('Storage reference created');
          
          console.log('Starting file upload...');
          await uploadBytes(storageRef, file);
          console.log('File uploaded, getting download URL...');
          
          const downloadURL = await getDownloadURL(storageRef);
          console.log('Download URL:', downloadURL);
          qrUrls.push(downloadURL);
        } catch (fileError) {
          const error = fileError as Error;
          console.error(`Error processing file ${file.name}:`, error);
          throw error; // Re-throw to be caught by the outer catch
        }
      }

      if (qrUrls.length > 0) {
        console.log('All files uploaded. Saving to Firestore...');
        console.log('Firestore document path: adminData/qrCodes');
        console.log('URLs to save:', qrUrls);
        
        const qrDocRef = doc(db, "adminData", "qrCodes");
        try {
          // First try to update the document
          await updateDoc(qrDocRef, {
            urls: arrayUnion(...qrUrls),
            updatedAt: new Date().toISOString()
          });
        } catch (error: unknown) {
          const firebaseError = error as { code?: string };
          // If document doesn't exist, create it with setDoc and merge: true
          if (firebaseError.code === 'not-found') {
            await setDoc(qrDocRef, {
              urls: qrUrls,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }, { merge: true });
          } else {
            throw error; // Re-throw other errors
          }
        }
        console.log('Firestore update successful');
      }

      alert("QR codes uploaded successfully!");
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (error: unknown) {
      const err = error as Error & { code?: string };
      console.error("Error in QR code upload process:", err);
      
      if (err.code === 'storage/unauthorized') {
        alert('You do not have permission to upload files. Please check your Firebase Storage rules.');
      } else if (err.code === 'storage/retry-limit-exceeded') {
        alert('The operation took too long. Please check your internet connection and try again.');
      } else {
        console.error('Error details:', {
          name: err.name,
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        alert(`Failed to upload QR codes: ${err.message || 'Unknown error'}`);
      }
    } finally {
      console.log('Upload process completed');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Upload className="text-blue-600" size={20} />
        Upload QR Codes
      </h2>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="qr-upload"
        />
        <label
          htmlFor="qr-upload"
          className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Upload className="mr-2 h-4 w-4" />
          Select QR Code Images
        </label>
        <p className="mt-2 text-sm text-gray-500">
          {selectedFiles.length > 0 
            ? `${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''} selected` 
            : 'or drag and drop files here'}
        </p>
      </div>

      {previewUrls.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length})
          </h3>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img 
                  src={url} 
                  alt={`QR Code ${index + 1}`}
                  className="h-20 w-full object-contain bg-gray-50 p-1 rounded border"
                />
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading || selectedFiles.length === 0}
            className={`mt-4 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading || selectedFiles.length === 0
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length} QR Code${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      )}
    </div>
  );
}
