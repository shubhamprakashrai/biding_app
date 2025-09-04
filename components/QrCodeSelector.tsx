'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface QrCodeSelectorProps {
  projectId: string;
  currentQrCode?: string;
}

export default function QrCodeSelector({ projectId, currentQrCode }: QrCodeSelectorProps) {
  const [qrCodes, setQrCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState(currentQrCode || '');

  useEffect(() => {
    const fetchQrCodes = async () => {
      try {
        const docRef = doc(db, 'adminData', 'qrCodes');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setQrCodes(data.urls || []);
          
          // If no current QR code is set, use the first one
          if (!currentQrCode && data.urls?.length > 0) {
            setSelectedQr(data.urls[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching QR codes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCodes();
  }, [currentQrCode]);

  const handleQrCodeChange = async (value: string) => {
    setSelectedQr(value);
    
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        paymentQrCode: value,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating QR code:', error);
      // Revert the UI on error
      setSelectedQr(currentQrCode || '');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    );
  }

  if (qrCodes.length === 0) {
    return <div className="text-sm text-gray-500">No QR codes available</div>;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">Payment QR Code</label>
      <Select value={selectedQr} onValueChange={handleQrCodeChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a QR code" />
        </SelectTrigger>
        <SelectContent>
          {qrCodes.map((url, index) => (
            <SelectItem key={index} value={url}>
              QR Code {index + 1}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedQr && (
        <div className="mt-2 p-2 border rounded-md">
          <img 
            src={selectedQr} 
            alt="Selected QR Code" 
            className="h-32 w-32 mx-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}
