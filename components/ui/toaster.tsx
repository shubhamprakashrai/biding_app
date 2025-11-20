'use client';

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={5000}>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast
          key={id}
          variant={variant}
          className={cn(
            "relative flex items-start justify-between gap-3 rounded-lg shadow-lg p-4 border w-full max-w-sm mx-auto",
            variant === "destructive"
              ? "bg-red-500 text-white border-red-600"
              : "bg-green-500 text-white border-green-600"
          )}
          {...props}
        >
          <div className="grid gap-1 pr-6">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>

          {/* ❌ Close Button (Visible X button) */}
          <ToastClose
            className="
              absolute right-3 top-3 text-white/90 hover:text-white 
              transition-colors text-lg leading-none
            "
          >
            ×
          </ToastClose>
        </Toast>
      ))}

      {/* VIEWPORT (TOP CENTER) */}
      <ToastViewport
        className="
          fixed top-5 left-1/2 -translate-x-1/2 
          z-[99999] flex flex-col gap-3 w-full max-w-sm
        "
      />
    </ToastProvider>
  );
}
