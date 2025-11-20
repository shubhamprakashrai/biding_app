"use client";

import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitives.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      // FORCE TOP-CENTER POSITION
      "fixed top-5 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-3 w-full max-w-sm outline-none",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

// Toast Styles
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & {
    variant?: "default" | "destructive";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const isError = variant === "destructive";

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(
        "rounded-lg p-4 shadow-lg border transition-all",
        isError
          ? "bg-red-500 text-white border-red-600"
          : "bg-green-500 text-white border-green-600",
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastAction = ToastPrimitives.Action;
const ToastClose = ToastPrimitives.Close;
const ToastTitle = ToastPrimitives.Title;
const ToastDescription = ToastPrimitives.Description;

export {
  ToastProvider,
  Toast,
  ToastViewport,
  ToastClose,
  ToastAction,
  ToastTitle,
  ToastDescription,
};
