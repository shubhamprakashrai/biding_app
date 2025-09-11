'use client';

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { ExternalLink, RefreshCw, Loader2 } from "lucide-react";

interface QrCode {
  id: string;
  name: string;
  url: string;
}

interface QrCodeDropdownProps {
  onRefresh?: () => void;
}

export default function QrCodeDropdown({ onRefresh }: QrCodeDropdownProps) {
  const [qrCodes, setQrCodes] = useState<QrCode[]>([]);
  const [selectedQr, setSelectedQr] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchQrCodes = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "adminData", "qrCodes");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setQrCodes(data.qrCodes || []);
      }
    } catch (error) {
      console.error("Error fetching QR codes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    if (onRefresh) onRefresh();
  };

  useEffect(() => {
    fetchQrCodes();
  }, [refreshTrigger]);

  const handleViewQr = () => {
    if (selectedQr) {
      const qr = qrCodes.find(qr => qr.id === selectedQr);
      if (qr) {
        window.open(qr.url, '_blank');
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center text-gray-500">Loading QR codes...</div>;
  }

  if (qrCodes.length === 0) {
    return <div className="p-4 text-center text-gray-500">No QR codes found</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">QR Codes</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-1"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Select onValueChange={setSelectedQr} value={selectedQr}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a QR code" />
          </SelectTrigger>
          <SelectContent>
            {qrCodes.map((qr) => (
              <SelectItem key={qr.id} value={qr.id}>
                {qr.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button 
          onClick={handleViewQr}
          disabled={!selectedQr}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          View
        </Button>
      </div>
      {selectedQr && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {qrCodes.find(qr => qr.id === selectedQr)?.name}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open(qrCodes.find(qr => qr.id === selectedQr)?.url, '_blank')}
              className="text-blue-600 hover:bg-blue-50"
            >
              Open in new tab
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
