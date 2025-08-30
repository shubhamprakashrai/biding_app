'use client';

import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { signInWithGoogle, db } from '@/app/firebase/firebase';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';

export default function GoogleLoginButton() {
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign in...');
      const user = await signInWithGoogle();
      
      // Get the user's data from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('Failed to get user data from Firestore');
      }
      
      // Store user data in localStorage for the Navigation component
      const userToStore = {
        email: userData.email,
        name: userData.name || user.displayName || user.email?.split('@')[0] || 'User',
        role: userData.role || 'USER',
        photoURL: userData.photoURL || '',
        uid: user.uid
      };
      
      console.log('Storing user data:', userToStore);
      localStorage.setItem('user', JSON.stringify(userToStore));
      
      // Force a refresh to update the Navigation component
      window.dispatchEvent(new Event('storage'));
      
      // Redirect based on role
      const userRole = userData?.role || 'USER';
      if (userRole === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
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
