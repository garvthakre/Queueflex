"use client";

import { NextPage } from "next";
import React, { useState } from "react";
import { SignupFormData } from "../../api/interface";
import authService from "../../services/Authservices";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Page: NextPage = () => {
  const router = useRouter();
  const [formdata, setformdata] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Role selection: "user" | "provider"
  const [selectedRole, setSelectedRole] = useState<"user" | "provider">("user");

  const [error, seterror] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformdata((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setPasswordStrength(calculatePasswordStrength(value));
    if (error) seterror("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formdata.password !== formdata.confirmPassword) {
      seterror("Passwords do not match");
      return;
    }
    if (formdata.password.length < 8) {
      seterror("Password must be at least 8 characters long");
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.Signup({
        name: formdata.name,
        email: formdata.email,
        password: formdata.password,
        is_admin: selectedRole === "provider",
      });
      router.push("/login");
    } catch (err: any) {
      seterror(err?.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0: case 1: return "bg-red-500";
      case 2: return "bg-yellow-500";
      case 3: return "bg-blue-500";
      case 4: return "bg-green-500";
      default: return "bg-slate-600";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0: case 1: return "Weak";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Strong";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block group">
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform duration-300">
                Queueflex
              </h1>
            </Link>
            <p className="text-slate-300 text-sm font-medium">Create your account to get started</p>
          </div>

          {/* ── ROLE SELECTOR ── */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-slate-200 mb-3 text-center">I want to sign up as</p>
            <div className="grid grid-cols-2 gap-3">
              {/* User card */}
              <button
                type="button"
                onClick={() => setSelectedRole("user")}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
                  selectedRole === "user"
                    ? "border-purple-400 bg-purple-500/20 shadow-lg shadow-purple-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {selectedRole === "user" && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className={`p-2 rounded-xl transition-colors ${selectedRole === "user" ? "bg-purple-500/30" : "bg-white/10"}`}>
                  <svg className={`w-6 h-6 ${selectedRole === "user" ? "text-purple-300" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${selectedRole === "user" ? "text-purple-300" : "text-slate-300"}`}>Customer</p>
                  <p className="text-xs text-slate-400 mt-0.5">Book services</p>
                </div>
              </button>

              {/* Provider card */}
              <button
                type="button"
                onClick={() => setSelectedRole("provider")}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer group ${
                  selectedRole === "provider"
                    ? "border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-500/20"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {selectedRole === "provider" && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className={`p-2 rounded-xl transition-colors ${selectedRole === "provider" ? "bg-blue-500/30" : "bg-white/10"}`}>
                  <svg className={`w-6 h-6 ${selectedRole === "provider" ? "text-blue-300" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${selectedRole === "provider" ? "text-blue-300" : "text-slate-300"}`}>Provider</p>
                  <p className="text-xs text-slate-400 mt-0.5">Manage queues</p>
                </div>
              </button>
            </div>

            {/* Role info banner */}
            {selectedRole === "provider" && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <svg className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-300 leading-relaxed">
                  Provider accounts can create and manage services, and update customer queue statuses.
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-200 text-sm flex items-start gap-3">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block pl-1">Full Name</label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formdata.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block pl-1">Email Address</label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formdata.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 pl-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block pl-1">Password</label>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formdata.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {formdata.password && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1.5">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? getPasswordStrengthColor() : "bg-white/10"}`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-300 pl-1">Password strength: <span className="font-bold">{getPasswordStrengthText()}</span></p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-200 block pl-1">Confirm Password</label>
              <div className="relative group">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formdata.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 pl-12 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 group-hover:bg-white/10"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-400 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors focus:outline-none">
                  {showConfirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {formdata.confirmPassword && (
                <div className="flex items-center gap-2 text-xs pt-1 pl-1">
                  {formdata.password === formdata.confirmPassword ? (
                    <><svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-green-400 font-semibold">Passwords match</span></>
                  ) : (
                    <><svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg><span className="text-red-400 font-semibold">Passwords don't match</span></>
                  )}
                </div>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3 pt-1">
              <input type="checkbox" id="terms" required className="w-4 h-4 mt-1 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 cursor-pointer transition-all" />
              <label htmlFor="terms" className="text-sm text-slate-300 cursor-pointer leading-relaxed">
                I agree to the{" "}
                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors font-semibold underline">Privacy Policy</a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Creating account...</span>
                </span>
              ) : (
                `Create ${selectedRole === "provider" ? "Provider" : "Customer"} Account`
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p className="text-slate-300 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-purple-400 hover:text-purple-300 font-bold transition-colors hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-400 text-xs mt-6 px-4">
          Protected by reCAPTCHA and subject to the Queueflex{" "}
          <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default Page;