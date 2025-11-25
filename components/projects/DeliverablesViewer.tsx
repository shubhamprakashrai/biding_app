"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";

interface Deliverable {
  type: "apk" | "zip" | "code";
  url: string;
  fileName: string;
  uploadedAt: any;
}

interface DeliverablesViewerProps {
  deliverables: Deliverable[];
  isAdmin?: boolean;
  paymentStatus?: string;
}

export default function DeliverablesViewer({ 
  deliverables, 
  isAdmin = false, 
  paymentStatus = '' 
}: DeliverablesViewerProps) {
  const [open, setOpen] = useState(false);

  // Filter deliverables based on payment status
  const filteredDeliverables = deliverables.filter(deliverable => {
    // Always show APK files to everyone
    if (deliverable.type === 'apk') return true;
    
    // For non-admin users, show ZIP and code only if payment is completed
    if (!isAdmin) {
      return paymentStatus === 'PAYMENT_COMPLETED';
    }
    
    // Admin can see all files
    return true;
  });

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (filteredDeliverables.length === 0) return null;

  return (
    <div className="mt-4">
      <Button onClick={() => setOpen(true)} className="w-full">
        {isAdmin ? "Download Deliverables" : "View Deliverables"}
      </Button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="bg-white rounded-xl w-full max-w-md p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-medium text-gray-900 mb-4">Deliverables</h3>

            <div className="space-y-3">
              {filteredDeliverables.map((item, index) => (
                <div key={index} className="flex items-center justify-between border p-2 rounded">
                  <span className="capitalize">{item.type} - {item.fileName}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(item.url, item.fileName)}
                    className="flex items-center gap-2"
                  >
                    <Download size={16} /> Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}