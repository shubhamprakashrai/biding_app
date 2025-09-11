"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PaymentHistoryDialogProps {
  open: boolean;
  onClose: (open: boolean) => void;
  payments: any[]; // PaymentEntry[]
}

export default function PaymentHistoryDialog({ open, onClose, payments }: PaymentHistoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Payment History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto">
          {payments.map((payment, index) => (
            <div
              key={index}
              className="border p-4 rounded-lg bg-gray-50 shadow-sm flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Transaction ID:</span>{" "}
                  {payment.transactionId}
                </p>
                <Badge
                  className={
                    payment.status === "PAYMENT_COMPLETED"
                      ? "bg-green-500"
                      : payment.status === "PAYMENT_UNDER_REVIEW"
                      ? "bg-amber-500"
                      : payment.status === "PAYMENT_PROCESSING"
                      ? "bg-blue-500"
                      : "bg-red-500"
                  }
                >
                  {payment.status}
                </Badge>
              </div>

              {/* Dates */}
              <p className="text-xs text-gray-500">
                Submitted: {format(payment.submittedAt.toDate(), "dd MMM yyyy, HH:mm")}
              </p>
              {payment.reviewedAt && (
                <p className="text-xs text-gray-500">
                  Reviewed: {format(payment.reviewedAt.toDate(), "dd MMM yyyy, HH:mm")}
                </p>
              )}

              {/* Screenshot */}
              {payment.screenshot && (
                <img
                  src={payment.screenshot}
                  alt="Proof"
                  className="w-32 h-32 object-cover rounded-md border mt-2 cursor-pointer"
                />
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
