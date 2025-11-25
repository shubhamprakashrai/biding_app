'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useRouter } from 'next/navigation';
import { useAuthViewModel } from '@/viewmodels/AuthViewModel';
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function GoogleLoginButton() {
  const router = useRouter();
  const { signInWithGoogle } = useAuthViewModel();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();

      showSuccessToast("Login Successful");

      // Redirect based on role
      const redirectPath = result.user.role === "ADMIN"
        ? "/admin"
        : result.user.role === "DEV"
          ? "/dev-dashboard"
          : "/dashboard";

      router.push(redirectPath);

    } catch (error) {
      showErrorToast("Sign in failed");
      console.error('Error signing in with Google:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-70"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="w-5 h-5" />
      <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
    </Button>
  );
}
