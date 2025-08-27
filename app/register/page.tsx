'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';

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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      // ✅ Create user with email & password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // ✅ Update display name
      await updateProfile(userCredential.user, { displayName: formData.name });

      // ✅ Save extra info to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: new Date()
      });

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (error: any) {
      setError(error.code ? getAuthErrorMessage(error.code) : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>

        {error && <div className="text-red-600 bg-red-100 px-4 py-3 rounded">{error}</div>}
        {success && <div className="text-green-600 bg-green-100 px-4 py-3 rounded">{success}</div>}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              name="name"
              type="text"
              placeholder="Full Name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="email"
              type="email"
              placeholder="Email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-2 px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign up'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account? <a href="/login" className="text-blue-600">Log in</a>
        </p>
      </div>
    </div>
  );
}
