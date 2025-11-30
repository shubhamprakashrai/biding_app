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
import type { ToastProps } from "./toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={5000}>
      {toasts.map(({ id, title, description, action, variant = 'default', ...props }) => {
        // Map the variant to a valid variant for Radix UI Toast
        const toastVariant: ToastProps['variant'] = variant === 'warning' ? 'default' : variant;
        
        return (
          <Toast
            key={id}
            variant={toastVariant}
            className={cn(
              "relative flex items-start justify-between gap-3 rounded-lg shadow-lg p-4 border w-full max-w-sm mx-auto",
              variant === "destructive"
                ? "bg-red-500 text-white border-red-600"
                : variant === "warning"
                ? "bg-yellow-500 text-white border-yellow-600"
                : "bg-green-500 text-white border-green-600"
            )}
            {...props}
          >
            <div className="grid gap-1 pr-6">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>

            {action}

            <ToastClose
              className="
                absolute right-3 top-3 text-white/90 hover:text-white 
                transition-colors text-lg leading-none
              "
            >
              ×
            </ToastClose>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}