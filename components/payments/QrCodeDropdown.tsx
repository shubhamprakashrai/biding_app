'use client';

import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ExternalLink, RefreshCw, Loader2 } from "lucide-react";
import { useQrCodesViewModel } from "@/viewmodels/QrCodesViewModel";

interface QrCodeDropdownProps {
  onRefresh?: () => void;
}

export default function QrCodeDropdown({ onRefresh }: QrCodeDropdownProps) {
  // Use global QR codes store
  const {
    qrCodes,
    isLoading,
    isInitialized,
    initialize,
    forceRefresh
  } = useQrCodesViewModel();

  const [selectedQr, setSelectedQr] = useState<string>("");

  // Initialize QR codes from global store (cached)
  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRefresh = () => {
    forceRefresh();
    if (onRefresh) onRefresh();
  };

  const handleViewQr = () => {
    if (selectedQr) {
      const qr = qrCodes.find(qr => qr.id === selectedQr);
      if (qr) {
        window.open(qr.url, '_blank');
      }
    }
  };

  // Show loading only on initial load
  if (isLoading && !isInitialized) {
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
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          {isLoading ? (
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
