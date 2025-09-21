

"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/app/firebase/firebase";
import { Copy, Check } from "lucide-react";

interface PaymentDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  qrId: string;
  projectId: string;
  projectName: string;
}

export default function PaymentDialog({ open, onClose, qrId, projectId, projectName }: PaymentDialogProps) {
  const [qrValue, setQrValue] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<boolean>(false);

  const [transactionId, setTransactionId] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  useEffect(() => {
    if (open && qrId) {
      fetchQrFromFirestore(qrId);
    } else {
      setQrValue("");
      setPaymentId("");
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
          setPaymentId(found.paymentId || '');
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

  // Upload Screenshot to Firebase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setUploading(true);

    try {
      const storageRef = ref(storage, `paymentProofs/${projectId}/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setScreenshotUrl(url);
    } catch (err) {
      console.error("File upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  // Save Payment Confirmation
  const handleConfirmPayment = async () => {
    if (!transactionId || !screenshotUrl) {
      alert("Please upload screenshot and enter transaction ID.");
      return;
    }

    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        paymentProof: screenshotUrl,
        transactionId,
        paymentConfirmedByUser: true,
        status: "PAYMENT_UNDER_REVIEW",
        updatedAt: serverTimestamp(),
      });
      alert("Payment details submitted successfully!");
      setUploadMode(false);
      onClose(false);
    } catch (err) {
      console.error("Error updating Firestore:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Payment for {projectName}</DialogTitle>
        </DialogHeader>

        {/* QR Code Always Visible */}
        <div className="flex flex-col items-center justify-center gap-4 py-6">
          {loading ? (
            <p className="text-sm text-gray-500">Loading QR...</p>
          ) : qrValue ? (
            <>
              <img src={qrValue} alt="Payment QR" className="w-48 h-48 object-contain rounded-lg shadow" />
              <p className="text-sm text-gray-600 text-center">
                Scan this QR code with any UPI / Payment app to complete your payment.
              </p>
              {paymentId && (
                <div className="mt-2 w-full max-w-xs">
                  <p className="text-xs text-gray-500 mb-1 text-left">Payment ID:</p>
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                    <p className="font-mono text-sm font-medium flex-1 truncate pr-2">
                      {paymentId}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 hover:bg-gray-200"
                      onClick={() => copyToClipboard(paymentId)}
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-red-500">QR not available</p>
          )}
        </div>

        {/* Toggle Button */}
        <Button className="w-full mt-2" onClick={() => setUploadMode(!uploadMode)}>
          {uploadMode ? "Hide Upload Form" : "I’ve Paid – Upload Proof"}
        </Button>

        {/* Conditional Upload Form */}
        {uploadMode && (
          <div className="flex flex-col gap-4 py-4">
            {/* Screenshot Upload */}
            <div>
              <label className="text-sm font-medium">Upload Screenshot</label>
              <Input type="file" accept="image/*" onChange={handleFileUpload} />
              {uploading && <p className="text-xs text-gray-500 mt-1">Uploading...</p>}
              {screenshotUrl && (
                <img
                  src={screenshotUrl}
                  alt="Proof"
                  className="mt-2 w-32 h-32 object-cover rounded-md border"
                />
              )}
            </div>

            {/* Transaction ID */}
            <div>
              <label className="text-sm font-medium">Transaction / UTR ID</label>
              <Input
                type="text"
                placeholder="Enter Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <Button className="w-full mt-2" onClick={handleConfirmPayment} disabled={uploading}>
              Submit Payment Proof
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
