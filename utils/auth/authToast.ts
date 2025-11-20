// utils/auth/authToast.ts
"use client";

import { toast } from "@/hooks/use-toast";

/**
 * Success Toast (Green)
 */
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "default", // green (default)
  });
};

/**
 * Error Toast (Red)
 */
export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive", // red
  });
};

/**
 * Warning Toast (Yellow)
 */
export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "warning",
  });
};

/**
 * Info Toast (Blue / Default)
 */
export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
  });
};
