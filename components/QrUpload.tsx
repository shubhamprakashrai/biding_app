'use client';

import { useState, useRef } from "react";
import { db } from "@/app/firebase/firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc, arrayUnion } from "firebase/firestore";
import { Loader2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export default function QrUpload() {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentQr, setCurrentQr] = useState({ name: '', file: null as File | null });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setCurrentQr(prev => ({ ...prev, file: e.target.files![0] }));
  };

  const handleAddQr = async () => {
    if (!currentQr.file || !currentQr.name) return;
    setLoading(true);

    try {
      // 1. Upload file to Firebase Storage
      const storage = getStorage();
      const storageRef = ref(storage, `qr_codes/${Date.now()}-${currentQr.file.name}`);
      await uploadBytes(storageRef, currentQr.file);
      const downloadURL = await getDownloadURL(storageRef);

      // 2. Save to Firestore
      const qrDocRef = doc(db, "adminData", "qrCodes");
      await setDoc(qrDocRef, {
        qrCodes: arrayUnion({
          id: `qr_${Date.now()}`,
          url: downloadURL,
          name: currentQr.name
        }),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      alert("QR Code uploaded successfully!");

      // Reset state
      setCurrentQr({ name: '', file: null });
      if (fileInputRef.current) fileInputRef.current.value = '';
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to upload QR code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">QR Codes</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Add QR
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
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
              />
              <Button
                onClick={handleAddQr}
                disabled={!currentQr.file || !currentQr.name || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                ) : "Add & Upload"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
