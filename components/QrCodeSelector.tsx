'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/firebase/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface QRCode {
  id: string;
  name: string;
  url: string;
}

interface QrCodeSelectorProps {
  projectId?: string;
  currentQrCode?: string;
  onQrCodeSelect?: (qrId: string) => void;
  onSelectQrCode?: (qrId: string) => void;
}

export default function QrCodeSelector({ projectId, currentQrCode, onQrCodeSelect, onSelectQrCode }: QrCodeSelectorProps) {
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQr, setSelectedQr] = useState(currentQrCode || '');

  const handleQrCodeSelect = async (qrId: string) => {
    setSelectedQr(qrId);
    
    // Call the onSelectQrCode callback if provided
    if (onSelectQrCode) {
      onSelectQrCode(qrId);
      return;
    }
    
    // Legacy support for onQrCodeSelect
    if (projectId) {
      try {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, {
          paymentQrCode: qrId,
          updatedAt: serverTimestamp()
        });
        onQrCodeSelect?.(qrId);
      } catch (error) {
        console.error('Error updating project with QR code:', error);
      }
    } else {
      onQrCodeSelect?.(qrId);
    }
  };

  // Set up real-time listener for QR codes
  useEffect(() => {
    const docRef = doc(db, 'adminData', 'qrCodes');
    
    // Subscribe to document changes
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data && Array.isArray(data.qrCodes)) {
            let codes = [...data.qrCodes];
            
            // If there's a current QR code, make sure it's in the list
            if (currentQrCode && !codes.some((q: QRCode) => q.id === currentQrCode)) {
              // If the current QR code is not in the list, add it
              codes.push({ id: currentQrCode, name: 'Current QR Code', url: currentQrCode });
            }
            
            setQrCodes(codes);
          }
        }
      } catch (error) {
        console.error('Error in QR codes listener:', error);
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error setting up QR codes listener:', error);
      setLoading(false);
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [currentQrCode]);

  const handleQrCodeChange = async (value: string) => {
    await handleQrCodeSelect(value);
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
    <div className="w-full">
      <Select value={selectedQr} onValueChange={handleQrCodeChange} disabled={loading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a QR code" />
        </SelectTrigger>
        <SelectContent>
          {qrCodes.map((qr) => (
            <SelectItem key={qr.id} value={qr.id}>
              <div className="flex items-center">
                <img src={qr.url} alt={qr.name} className="w-6 h-6 mr-2" />
                <span>{qr.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedQr && (
        <div className="mt-2 p-2 border rounded-md">
          <img 
            src={qrCodes.find(qr => qr.id === selectedQr)?.url} 
            alt="Selected QR Code" 
            className="h-32 w-32 mx-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}
