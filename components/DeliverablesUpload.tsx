"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db, storage } from "@/app/firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc, doc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { X } from "lucide-react";

interface DeliverablesUploadProps {
  projectId: string;
  open: boolean;
  onClose: () => void;
}

export default function DeliverablesUploadModal({ projectId, open, onClose }: DeliverablesUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<{
    apk?: File;
    zip?: File;
    code?: File;
  }>({});
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "apk" | "zip" | "code") => {
    if (!e.target.files?.[0]) return;
    setSelectedFiles((prev) => ({ ...prev, [type]: e.target.files![0] }));
  };

  const handleSubmit = async () => {
    if (!selectedFiles.apk && !selectedFiles.zip && !selectedFiles.code) {
      alert("Please select at least one file to upload.");
      return;
    }
  
    setUploading(true);
  
    try {
      const projectRef = doc(db, "projects", projectId);
  
      for (const type of ["apk", "zip", "code"] as const) {
        const file = selectedFiles[type];
        if (!file) continue;
  
        const storageRef = ref(storage, `deliverables/${projectId}/${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
  
        // Use client-side timestamp instead of serverTimestamp
        await updateDoc(projectRef, {
          deliverables: arrayUnion({
            type,
            url,
            fileName: file.name,
            uploadedAt: new Date(), // <- changed here
          }),
        });
      }
  
      alert("Files uploaded successfully!");
      setSelectedFiles({});
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading files.");
    } finally {
      setUploading(false);
    }
  };
  
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-md p-6 relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Deliverables</h3>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Upload APK</label>
            <Input
              type="file"
              accept=".apk"
              onChange={(e) => handleFileChange(e, "apk")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Upload ZIP</label>
            <Input
              type="file"
              accept=".zip"
              onChange={(e) => handleFileChange(e, "zip")}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Upload Source Code</label>
            <Input type="file" onChange={(e) => handleFileChange(e, "code")} />
          </div>
        </div>

        {uploading && (
          <p className="text-xs text-gray-500 mt-2">Uploading files...</p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handleSubmit} disabled={uploading}>
            {uploading ? "Uploading..." : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
