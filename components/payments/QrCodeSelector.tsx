'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/services/firebase/FirebaseService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useQrCodesViewModel } from '@/viewmodels/QrCodesViewModel';

interface QrCodeSelectorProps {
  projectId?: string;
  currentQrCode?: string;
  onQrCodeSelect?: (qrId: string) => void;
  onSelectQrCode?: (qrId: string) => void;
}

export default function QrCodeSelector({ projectId, currentQrCode, onQrCodeSelect, onSelectQrCode }: QrCodeSelectorProps) {
  // Use global QR codes store
  const {
    qrCodes,
    isLoading,
    isInitialized,
    initialize
  } = useQrCodesViewModel();

  const [selectedQr, setSelectedQr] = useState(currentQrCode || '');

  // Initialize QR codes from global store (cached)
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Update selectedQr when currentQrCode prop changes
  useEffect(() => {
    if (currentQrCode) {
      setSelectedQr(currentQrCode);
    }
  }, [currentQrCode]);

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

  const handleQrCodeChange = async (value: string) => {
    await handleQrCodeSelect(value);
  };

  // Show loading only on initial load
  if (isLoading && !isInitialized) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    );
  }

  // Get QR codes list, adding current QR code if not in list
  const displayQrCodes = [...qrCodes];
  if (currentQrCode && !displayQrCodes.some(q => q.id === currentQrCode)) {
    displayQrCodes.push({ id: currentQrCode, name: 'Current QR Code', url: currentQrCode });
  }

  if (displayQrCodes.length === 0) {
    return <div className="text-sm text-gray-500">No QR codes available</div>;
  }

  return (
    <div className="w-full">
      <Select value={selectedQr} onValueChange={handleQrCodeChange} disabled={isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a QR code" />
        </SelectTrigger>
        <SelectContent>
          {displayQrCodes.map((qr) => (
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
            src={displayQrCodes.find(qr => qr.id === selectedQr)?.url}
            alt="Selected QR Code"
            className="h-32 w-32 mx-auto object-contain"
          />
        </div>
      )}
    </div>
  );
}
