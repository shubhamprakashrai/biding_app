'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiCheck, FiAlertCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import GoogleLoginButton from '@/components/GoogleLoginButton';

function getAuthErrorMessage(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'This email is already in use. Please use a different email or sign in.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled.';
    default:
      return 'An error occurred during registration. Please try again.';
  }
}

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!formData.password) return setPasswordStrength(0);
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/\d/.test(formData.password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) strength++;
    if (/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) strength++;
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await updateProfile(userCredential.user, { displayName: formData.name });
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date(),
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
      });
      
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: formData.email,
          role: formData.role,
          name: formData.name
        })
      );      
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    } catch (error: any) {
      const errorMessage = error.code ? getAuthErrorMessage(error.code) : 'Failed to create account';
      setErrors({ ...errors, form: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-blue-900/30 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-700/50 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create an account</h1>
          <p className="text-blue-200/80">Join us today!</p>
        </div>

        <div className="space-y-6">
          <GoogleLoginButton />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-blue-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-blue-900/30 text-blue-200/70">Or continue with email</span>
            </div>
          </div>

          <AnimatePresence>
            {errors.form && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/10 border-l-4 border-red-400 p-4 mb-4 rounded"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiAlertCircle className="h-5 w-5 text-red-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-100">{errors.form}</p>
                  </div>
                </div>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 border-l-4 border-green-400 p-4 mb-4 rounded"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FiCheck className="h-5 w-5 text-green-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-100">{success}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-blue-100 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-blue-400/80" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-blue-900/50 border ${errors.name ? 'border-red-400/50' : 'border-blue-700/50'} rounded-lg shadow-sm text-white placeholder-blue-400/70 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors`}
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-300">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-blue-100 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-blue-400/80" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-blue-900/50 border ${errors.email ? 'border-red-400/50' : 'border-blue-700/50'} rounded-lg shadow-sm text-white placeholder-blue-400/70 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-300">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-100 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-blue-400/80" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 bg-blue-900/50 border ${errors.password ? 'border-red-400/50' : 'border-blue-700/50'} rounded-lg shadow-sm text-white placeholder-blue-400/70 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400/70 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-300">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-100 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-blue-400/80" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2.5 bg-blue-900/50 border ${errors.confirmPassword ? 'border-red-400/50' : 'border-blue-700/50'} rounded-lg shadow-sm text-white placeholder-blue-400/70 focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400/70 hover:text-blue-300 transition-colors"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-300">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-blue-100 mb-1">
                I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-2.5 bg-blue-900/50 border border-blue-700/50 rounded-lg shadow-sm text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors"
              >
                <option value="USER">User</option>
                <option value="DEVELOPER">Developer</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400 transition-all duration-200 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>

            <div className="text-center text-sm pt-2">
              <p className="text-blue-200/80">
                Already have an account?{' '}
                <a href="/login" className="font-medium text-cyan-300 hover:text-white transition-colors">
                  Sign in
                </a>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
