"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Page() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        {/* Hero section */}
        <section className="min-h-screen flex items-center justify-center px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-block mb-8 animate-fade-in">
              <span className="px-4 py-2 bg-purple-500/20 border border-purple-400/50 rounded-full text-purple-200 text-sm font-medium backdrop-blur-sm hover:bg-purple-500/30 transition-colors">
                ✨ Modern Queue Management Solution
              </span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight animate-fade-in animation-delay-100">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Queue Intelligence,
              </span>
              <br />
              <span className="text-white">Redefined</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in animation-delay-200">
              Eliminate wait times, empower your customers, and streamline
              service delivery. Queueflex transforms how businesses manage
              queues with intelligent automation and real-time insights.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row justify-center gap-4 mb-12 animate-fade-in animation-delay-300">
              <Link
                href="/signup"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg flex items-center justify-center gap-2"
              >
                Get Started Free
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              <Link
                href="/login"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 hover:border-white/40 transition-all duration-300 backdrop-blur-sm"
              >
                Sign In
              </Link>
            </div>

            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16 animate-fade-in animation-delay-400">
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-purple-500/50 transition-all group">
                <div className="text-2xl mb-2">⚡</div>
                <h3 className="font-semibold text-white mb-1">
                  Lightning Fast
                </h3>
                <p className="text-gray-400 text-sm">
                  Real-time queue tracking
                </p>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-blue-500/50 transition-all group">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-white mb-1">Smart Routing</h3>
                <p className="text-gray-400 text-sm">
                  Optimal service allocation
                </p>
              </div>

              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:border-pink-500/50 transition-all group">
                <div className="text-2xl mb-2">📊</div>
                <h3 className="font-semibold text-white mb-1">Analytics</h3>
                <p className="text-gray-400 text-sm">Data-driven insights</p>
              </div>
            </div>
          </div>
        </section>

        {/* Secondary CTA section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-lg border border-purple-400/30 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                Choose Your Experience
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/client/Booking"
                  className="group p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-3xl mb-3">👤</div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Customer
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Book services and track your queue position in real-time
                  </p>
                  <span className="text-purple-400 group-hover:text-purple-300 flex items-center gap-2">
                    Book Now
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </Link>

                <Link
                  href="/provider/dashboard"
                  className="group p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <div className="text-3xl mb-3">🏪</div>
                  <h3 className="text-lg font-bold text-white mb-2">
                    Provider
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Manage queues, staff, and services from your dashboard
                  </p>
                  <span className="text-blue-400 group-hover:text-blue-300 flex items-center gap-2">
                    Manage Dashboard
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
          <p>© 2026 Queueflex. Simplifying queues, improving service.</p>
        </div>
      </footer>
    </div>
  );
}
