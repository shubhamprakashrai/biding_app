'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/app/firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { FiUser, FiMail } from 'react-icons/fi';
import Link from 'next/link';
import { InputField, PasswordField } from '@/components/form';
import { validateRegisterForm } from '@/utils/auth/validateRegisterForm';
import { getAuthErrorMessage } from '@/utils/auth/getAuthErrorMessage';
import GoogleLoginButton from '@/components/GoogleLoginButton';
import { RegisterFormData } from '@/types/RegisterFormTypes';
import { useAuthStore } from '@/store/authStore';
import Cookies from "js-cookie";
import { showSuccessToast, showErrorToast } from "@/utils/auth/authToast";

export default function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore(state => state.setUser);

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: any) => {
    // setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const { name, value } = e.target;

    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear ONLY that field's error
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(formData);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      console.log('User registered with UID:', userCredential.user.uid);
      await updateProfile(userCredential.user, { displayName: formData.name });

      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        ...formData,
        createdAt: new Date(),
      });
      // Get user and ID token
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      const refreshToken = user.refreshToken;

      // ⬇️ Save tokens to localStorage
      localStorage.setItem("accessToken", idToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Create user info object
      const userInfo = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: formData.role,
        accessToken: idToken,
        refreshToken: refreshToken
      };

      // Save user info to localStorage
      localStorage.setItem("user", JSON.stringify(userInfo));
      
      // Update user state
      setUser(userInfo);
      
      // Set cookie for middleware
      Cookies.set("user", JSON.stringify(userInfo), { expires: 7 });

      setSuccess("Account created successfully!");
      showSuccessToast("Account created successfully!");
      // setTimeout(() => {
      //   router.push(formData.role === "ADMIN" ? "/admin" : "/dashboard");
      // }, 1500);
      setTimeout(() => {
        if (formData.role === "ADMIN") router.push("/admin");
        else if (formData.role === "DEV") router.push("/dev-dashboard");
        else router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      setErrors({ form: getAuthErrorMessage(error.code) });
      showErrorToast("Invalid credentials")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
      >

        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
            <p className="mt-2 text-sm text-gray-600">Join us in just a few steps.</p>
          </div>
          {/* Google Sign In Button */}
          <div className="mt-6 mb-6">
            <GoogleLoginButton />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm mb-6">
              <span className="px-2 bg-white text-gray-500">Or continue with details</span>
            </div>
          </div>
          <AnimatePresence>
            {errors.form && (
              <motion.div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start">
                {errors.form}
              </motion.div>
            )}

            {success && (
              <motion.div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-start">
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <form className="space-y-5" onSubmit={handleSubmit}>

            <InputField
              label="Full Name"
              name="name"
              icon={<FiUser />}
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="John Doe"
            />

            <InputField
              label="Email Address"
              name="email"
              icon={<FiMail />}
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
            />

            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              showPassword={showPassword}
              toggle={() => setShowPassword(prev => !prev)}
              onChange={handleChange}
              error={errors.password}
              placeholder="Enter your password"
            />

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              showPassword={showPassword}
              toggle={() => setShowPassword(prev => !prev)}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="Enter your confirm password"
            />

            {/* Original button with SAME styles */}
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent 
            text-sm font-medium rounded-xl text-white 
            bg-gradient-to-r from-emerald-500 to-teal-600 
            hover:shadow-md hover:shadow-emerald-100 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 
            transition-all duration-200 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <div className="text-center">
              <span className="text-gray-600">Already have an account? </span>
              <Link href="/login" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in here
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div >
  );
}
