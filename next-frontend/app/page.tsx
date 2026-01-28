"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 overflow-hidden">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTZ6TTI0IDBoMTJ2MTJIMjR6bTAgMzZoMTJ2MTJIMjR6IiBmaWxsPSJyZ2JhKDEzOSwgOTIsIDI0NiwgMC4wNSkiLz48L2c+PC9zdmc+')] opacity-20"></div>

      {/* Floating Orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-blob"></div>
      <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: "2s" }}></div>
      <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: "4s" }}></div>

      {/* Mouse Follower Gradient */}
      <div 
        className="pointer-events-none fixed inset-0 z-30 transition duration-300"
        style={{
          background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(139, 92, 246, 0.08), transparent 80%)`,
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/10 backdrop-blur-xl bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Queueflex
            </Link>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/login" 
                className="px-6 py-2.5 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2 mb-8 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-full backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                Live Queue Management Platform
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
              <span className="block bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent animate-gradient bg-300%">
                Queue Smarter,
              </span>
              <span className="block mt-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Serve Better
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Transform customer wait times into seamless experiences. 
              <span className="text-purple-400 font-medium"> Real-time tracking</span>, 
              <span className="text-pink-400 font-medium"> intelligent routing</span>, and 
              <span className="text-cyan-400 font-medium"> powerful analytics</span> for modern businesses.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-16">
              <Link
                href="/signup"
                className="group relative px-10 py-5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Start Free Today
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </Link>

              <Link
                href="/login"
                className="group px-10 py-5 bg-white/5 hover:bg-white/10 text-white text-lg font-bold rounded-xl border-2 border-white/20 hover:border-purple-400/50 transition-all duration-300 backdrop-blur-sm flex items-center gap-3"
              >
                <span>Watch Demo</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              {[
                { number: "10K+", label: "Active Users" },
                { number: "500K+", label: "Queues Managed" },
                { number: "99.9%", label: "Uptime" },
              ].map((stat, i) => (
                <div 
                  key={i} 
                  className="p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:border-purple-400/30 transition-all duration-300 hover:transform hover:scale-105"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-4xl font-black bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-400 text-sm font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Built for Modern Businesses
            </h2>
            <p className="text-xl text-gray-400">
              Everything you need to manage queues efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "⚡",
                title: "Lightning Fast",
                description: "Real-time queue updates with sub-second latency. Your customers always know their exact position.",
                color: "from-yellow-400 to-orange-500",
                borderColor: "border-yellow-500/30",
              },
              {
                icon: "🎯",
                title: "Smart Routing",
                description: "AI-powered service allocation ensures optimal wait times and resource utilization.",
                color: "from-blue-400 to-cyan-500",
                borderColor: "border-blue-500/30",
              },
              {
                icon: "📊",
                title: "Deep Analytics",
                description: "Comprehensive insights into queue patterns, peak hours, and customer behavior.",
                color: "from-purple-400 to-pink-500",
                borderColor: "border-purple-500/30",
              },
              {
                icon: "🔔",
                title: "Smart Notifications",
                description: "Automated alerts keep customers informed without them checking constantly.",
                color: "from-green-400 to-emerald-500",
                borderColor: "border-green-500/30",
              },
              {
                icon: "🛡️",
                title: "Enterprise Security",
                description: "Bank-grade encryption and compliance with international data protection standards.",
                color: "from-indigo-400 to-purple-500",
                borderColor: "border-indigo-500/30",
              },
              {
                icon: "🌐",
                title: "Multi-Location",
                description: "Manage queues across multiple branches from a single unified dashboard.",
                color: "from-pink-400 to-rose-500",
                borderColor: "border-pink-500/30",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group relative p-8 bg-white/5 backdrop-blur-sm rounded-2xl border ${feature.borderColor} hover:border-opacity-100 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className={`absolute -bottom-2 -right-2 w-32 h-32 bg-gradient-to-br ${feature.color} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-xl rounded-3xl border border-purple-500/20 p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12 text-center">
              Choose Your Path
            </h2>

            <div className="grid md:grid-cols-2 gap-8">
              <Link
                href="/client/Booking"
                className="group relative p-10 bg-gradient-to-br from-purple-500/10 to-transparent hover:from-purple-500/20 border-2 border-purple-400/30 hover:border-purple-400/60 rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl transform translate-x-20 -translate-y-20 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">
                    👤
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    For Customers
                  </h3>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    Book services instantly, track your position in real-time, and get notified when it's your turn.
                  </p>
                  <div className="flex items-center text-purple-400 font-semibold text-lg group-hover:translate-x-2 transition-transform">
                    Start Booking
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>

              <Link
                href="/provider/dashboard"
                className="group relative p-10 bg-gradient-to-br from-cyan-500/10 to-transparent hover:from-cyan-500/20 border-2 border-cyan-400/30 hover:border-cyan-400/60 rounded-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/20 rounded-full blur-3xl transform translate-x-20 -translate-y-20 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative z-10">
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">
                    🏪
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-4">
                    For Providers
                  </h3>
                  <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                    Manage queues, optimize operations, and deliver exceptional service with powerful analytics.
                  </p>
                  <div className="flex items-center text-cyan-400 font-semibold text-lg group-hover:translate-x-2 transition-transform">
                    Open Dashboard
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-2xl font-semibold text-gray-400 mb-12">
            Trusted by leading organizations worldwide
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 items-center opacity-50">
            {["TechCorp", "MediCare", "RetailPro", "ServiceHub"].map((brand, i) => (
              <div key={i} className="text-3xl font-bold text-white/60">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative p-16 bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 animate-gradient bg-300%"></div>
            
            <div className="relative z-10">
              <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
                Ready to Transform Your Queues?
              </h2>
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                Join thousands of businesses delivering exceptional customer experiences with Queueflex.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-3 px-12 py-5 bg-white text-purple-900 text-lg font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl"
              >
                Get Started Free
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <p className="text-sm text-gray-400 mt-6">
                No credit card required • Free forever plan • Setup in 2 minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
                Queueflex
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Modern queue management for modern businesses.
              </p>
            </div>
            
            {[
              {
                title: "Product",
                links: ["Features", "Pricing", "Security", "Updates"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
              {
                title: "Resources",
                links: ["Documentation", "API", "Support", "Status"],
              },
            ].map((column, i) => (
              <div key={i}>
                <h4 className="text-white font-semibold mb-4">{column.title}</h4>
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2026 Queueflex. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}