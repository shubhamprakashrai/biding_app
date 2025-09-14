'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Mail, Lock } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import GoogleLoginButton from '@/components/GoogleLoginButton';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    console.log('Login attempt started for:', formData.email);

    try {
      // Firebase sign in
      console.log('Attempting to sign in...');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;
      console.log('Firebase auth successful, user:', user.uid);

      // Fetch additional user data from Firestore
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert('User data not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      const userData = docSnap.data();
      const role = userData.role || 'USER';
      const userInfo = {
        email: user.email,
        role,
        name: userData.name || user.email?.split('@')[0] || 'User',
        uid: user.uid
      };

      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(userInfo));
      
      // Force a refresh to update the Navigation component
      window.dispatchEvent(new Event('storage'));

      // Redirect based on role
      if (role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'An error occurred during login. Please try again.';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email address.';
      }

      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950">
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 bg-blue-900/30 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-700/50 p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-blue-200/80 mt-2">Sign in to your account to continue</p>
          </div>

          {/* Google Sign In Button */}
          <div className="mt-6">
            <GoogleLoginButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-blue-900/30 text-blue-200/70">Or continue with email</span>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-400/80" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-blue-700/50 bg-blue-900/50 text-white placeholder-blue-400/70 pl-10 pr-4 py-3 shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-400/80" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-blue-700/50 bg-blue-900/50 text-white placeholder-blue-400/70 pl-10 pr-4 py-3 shadow-sm focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-400/70" aria-hidden="true" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-400/70" aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-blue-700 bg-blue-900/50 text-blue-400 focus:ring-blue-500 focus:ring-offset-blue-900"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-blue-100">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-300 hover:text-blue-200 transition-colors">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      Sign in
                    </>
                  )}
                </span>
              </button>
            </div>
          </form>

          <div className="text-center text-sm">
            <p className="mt-6 text-center text-sm text-blue-200/80">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold leading-6 text-cyan-300 hover:text-white transition-colors">
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
