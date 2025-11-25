'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail } from 'react-icons/fi';
import Link from 'next/link';
import { InputField, PasswordField } from '@/components/forms';
import { validateRegisterForm } from '@/lib/validation';
import { GoogleLoginButton } from '@/components/auth';
import { RegisterFormData } from '@/types/RegisterFormTypes';
import { useAuthViewModel } from '@/viewmodels/AuthViewModel';
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function RegisterForm() {
  const router = useRouter();
  const { registerWithEmail, isLoading } = useAuthViewModel();

  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "USER"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));

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

    try {
      const result = await registerWithEmail({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        role: formData.role
      });

      setSuccess("Account created successfully!");
      showSuccessToast("Account created successfully!");

      setTimeout(() => {
        const redirectPath = result.user.role === "ADMIN"
          ? "/admin"
          : result.user.role === "DEV"
            ? "/dev-dashboard"
            : "/dashboard";
        router.push(redirectPath);
      }, 1500);

    } catch (error: any) {
      setErrors({ form: error.message || "Registration failed" });
      showErrorToast("Registration failed");
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

            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent
            text-sm font-medium rounded-xl text-white
            bg-gradient-to-r from-emerald-500 to-teal-600
            hover:shadow-md hover:shadow-emerald-100
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500
            transition-all duration-200 ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
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
