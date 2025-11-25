"use client";

import { toast } from "@/hooks/use-toast";

/**
 * Success Toast (Green)
 */
export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "default",
  });
};

/**
 * Error Toast (Red)
 */
export const showErrorToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "destructive",
  });
};

/**
 * Warning Toast (uses default variant - toast component only supports default/destructive)
 */
export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    variant: "default",
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
