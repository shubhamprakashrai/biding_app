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
  paymentAmount?: number;
}

export default function PaymentDialog({ 
  open, 
  onClose, 
  qrId, 
  projectId, 
  projectName, 
  paymentAmount = 0 
}: PaymentDialogProps) {
  const [qrValue, setQrValue] = useState<string>("");
  const [paymentId, setPaymentId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadMode, setUploadMode] = useState<boolean>(false);

  const [transactionId, setTransactionId] = useState("");
  const [amount, setAmount] = useState(paymentAmount ? paymentAmount.toString() : "");
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
    const amountValue = parseFloat(amount);
    if (!transactionId || !screenshotUrl || isNaN(amountValue) || amountValue <= 0) {
      alert("Please fill in all fields with valid values (Amount must be greater than 0).");
      return;
    }

    try {
      const projectRef = doc(db, "projects", projectId);
      await updateDoc(projectRef, {
        paymentProof: screenshotUrl,
        transactionId,
        paymentAmount: amountValue,
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
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">Payment for {projectName}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto px-6 pb-6">

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
                />
              )}
            </div>

            {/* Amount */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount to Pay
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">₹</span>
                  </div>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                {paymentAmount > 0 && (
                  <p className="mt-1 text-sm text-gray-500">
                    Expected amount: ₹{paymentAmount.toFixed(2)}
                  </p>
                )}
              </div>
              <label className="text-sm font-medium">Transaction / UTR ID</label>
              <Input
                type="text"
                placeholder="Enter Transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
            </div>

            <Button 
              className="w-full mt-2" 
              onClick={handleConfirmPayment} 
              disabled={uploading || !screenshotUrl || !transactionId || !amount || parseFloat(amount) <= 0}
            >
              {uploading ? 'Uploading...' : 'Submit Payment Proof'}
            </Button>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
