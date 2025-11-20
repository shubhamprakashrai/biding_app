"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import Cookies from "js-cookie";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const setUser = useAuthStore((state) => state.setUser);

  // ---------------------------------------------
  // HANDLE INPUT CHANGE + CLEAR FIELD ERROR
  // ---------------------------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ---------------------------------------------
  // LOGIN SUBMIT
  // ---------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    let newErrors: any = {};
    if (!formData.email) newErrors.email = "Email is required.";
    if (!formData.password) newErrors.password = "Password is required.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    setIsLoading(true);

    try {
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Fetch user role from Firestore
      const userDocSnap = await getDoc(doc(db, "users", user.uid));
      if (!userDocSnap.exists()) {
        toast({
          variant: "destructive",
          title: "Account Error",
          description: "User record not found.",
        });
        setIsLoading(false);
        return;
      }

      const userData = userDocSnap.data();
      const role = userData.role || "USER";

      // Firebase tokens
      const accessToken = user.stsTokenManager.accessToken;
      const refreshToken = user.stsTokenManager.refreshToken;

      // Create user object
      const userInfo = {
        uid: user.uid,
        email: user.email || "",
        name: userData.name || user.email?.split("@")[0] || "User",
        role,
        accessToken,
        refreshToken,
      };

      // Save locally
      localStorage.setItem("user", JSON.stringify(userInfo));
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      // Save cookie for middleware
      Cookies.set("user", JSON.stringify(userInfo), { expires: 7 });

      // Save Zustand
      setUser(userInfo);

      // Toast success
      toast({
        description: `Login Successful`,
      });

      // Redirect by role
      router.push(role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (error: any) {
      let message = "Invalid email or password.";

      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        message = "Invalid email or password.";
        setErrors((prev) => ({
          ...prev,
          email: "Invalid email or password",
          password: "Invalid email or password",
        }));
      }

      toast({
        variant: "destructive",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------
  // RETURN UI
  // ---------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center">Sign in to your account</p>

        {/* Google Login */}
        <GoogleLoginButton />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>

        {/* FORM */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-3 rounded-xl border focus:ring-2 
                  ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"}
                `}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border focus:ring-2 
                  ${errors.password ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-emerald-500"}
                `}
                placeholder="Enter your password"
              />

              {/* show/hide icon */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-xl hover:shadow-md transition disabled:opacity-70"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/register" className="text-emerald-600 font-medium hover:text-emerald-500">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
