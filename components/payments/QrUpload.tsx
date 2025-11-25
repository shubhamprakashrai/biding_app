'use client';

import { useState, useRef } from "react";
import { db, storage } from "@/services/firebase/FirebaseService";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QrUploadProps {
  onUploadSuccess?: () => void;
}

export default function QrUpload({ onUploadSuccess }: QrUploadProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQr, setCurrentQr] = useState({ 
    name: '', 
    paymentId: '',
    file: null as File | null 
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setCurrentQr(prev => ({ ...prev, file: e.target.files![0] }));
  };

  const handleAddQr = async () => {
    if (!currentQr.file || !currentQr.name || !currentQr.paymentId) return;
    setLoading(true);

    try {
      // 1. Upload file to Firebase Storage
      const storageRef = ref(storage, `qr_codes/${Date.now()}-${currentQr.file.name}`);
      await uploadBytes(storageRef, currentQr.file);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Save to Firestore
      const qrDocRef = doc(db, "adminData", "qrCodes");
      await setDoc(qrDocRef, {
        qrCodes: arrayUnion({
          id: `qr_${Date.now()}`,
          url: downloadURL,
          name: currentQr.name,
          paymentId: currentQr.paymentId,
          createdAt: new Date().toISOString()
        }),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("QR Code uploaded successfully!");

      // Reset state
      setCurrentQr({ name: '', paymentId: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsModalOpen(false);
      
      // Trigger the onUploadSuccess callback if provided
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload QR code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-md">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Add QR
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap">
                Add New QR
          </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add QR Code</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Label>Name</Label>
              <Input
                value={currentQr.name}
                onChange={(e) => setCurrentQr({ ...currentQr, name: e.target.value })}
                placeholder="QR Code name"
              />
              <Label>Payment ID</Label>
              <Input
                value={currentQr.paymentId}
                onChange={(e) => setCurrentQr({ ...currentQr, paymentId: e.target.value })}
                placeholder="e.g., yourname@upi or UPI ID"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
              <Button
                onClick={handleAddQr}
                disabled={!currentQr.file || !currentQr.name || !currentQr.paymentId || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                ) : "Add & Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        </h2>
      </div>
    </div>
  );
}
