"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";

interface PaymentDialogProps {
    open: boolean;
    onClose: (open: boolean) => void;
    qrId: string;        // yaha projectId ki jagah qrId
    projectName: string;
  }
  
  export default function PaymentDialog({ open, onClose, qrId, projectName }: PaymentDialogProps) {
    const [qrValue, setQrValue] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
  
    useEffect(() => {
      if (open && qrId) {
        fetchQrFromFirestore(qrId);
      } else {
        setQrValue("");
      }
    }, [open, qrId]);
  
    const fetchQrFromFirestore = async (qrId: string) => {
      try {
        setLoading(true);
  
        const docRef = doc(db, "adminData", "qrCodes");
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const qrCodes = docSnap.data().qrCodes || [];
          const found = qrCodes.find((qr: any) => qr.id === qrId);
  
          if (found) {
            setQrValue(found.url);
          } else {
            console.error(`QR not found in array for id: ${qrId}`);
          }
        }
      } catch (err) {
        console.error("Error fetching QR:", err);
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-sm rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Scan to Pay</DialogTitle>
          </DialogHeader>
  
          <div className="flex flex-col items-center justify-center gap-4 py-6">
            {loading ? (
              <p className="text-sm text-gray-500">Loading QR...</p>
            ) : qrValue ? (
              <>
                <img src={qrValue} alt="Payment QR" className="w-48 h-48 object-contain" />
                <p className="text-sm text-gray-600 text-center">
                  Scan this QR code with any UPI / Payment app to complete your payment.
                </p>
              </>
            ) : (
              <p className="text-sm text-red-500">QR not available</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  