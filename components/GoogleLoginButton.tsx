'use client';

import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle } from '@/app/firebase/firebase';
import { useRouter } from 'next/navigation';

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (error) {
      console.error('Error signing in with Google:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
      onClick={handleGoogleSignIn}
    >
      <FcGoogle className="w-5 h-5" />
      <span>Continue with Google</span>
    </Button>
  );
}
