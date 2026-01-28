"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Home() {
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
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-purple-50 to-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              Queueflex
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 text-slate-700 hover:text-slate-900 transition-colors font-medium text-sm"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-purple-200 hover:shadow-purple-300 text-sm"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div
            className={`text-center transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-purple-100 border border-purple-300 rounded-full">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-purple-900">
                ✨ The Future of Queue Management is Here
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight text-slate-900">
              Wait Times Don't
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                Have to Be Painful
              </span>
            </h1>
              
            {/* Subtitle */}
            <p className="text-smd:text-xl text-slate-600 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              Transform customer waits into delightful experiences. Queueflex
              combines intelligent scheduling, real-time tracking, and powerful
              analytics to help you serve customers better.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/signup"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-purple-200 hover:shadow-purple-300"
              >
                Start Free Trial
                <svg
                  className="w-4 h-4 inline-block ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>

              <Link
                href="/login"
                className="px-8 py-4 bg-white text-slate-900 font-semibold rounded-lg border-2 border-slate-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-300"
              >
                Schedule a Demo
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
              {[
                { number: "50K+", label: "Happy Users" },
                { number: "2M+", label: "Customers Served" },
                { number: "99.9%", label: "System Uptime" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="text-3xl font-black bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1">
                    {stat.number}
                  </div>
                  <div className="text-slate-600 text-xs font-semibold">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Hero Image/Showcase */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 rounded-2xl blur-3xl opacity-20"></div>
              <div className="relative bg-white rounded-2xl border-2 border-slate-200 shadow-2xl p-8">
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-40 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg border border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-purple-600 mb-2">
                        3
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        Waiting
                      </div>
                    </div>
                  </div>
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg border border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 mb-2">
                        12m
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        Avg. Wait
                      </div>
                    </div>
                  </div>
                  <div className="h-40 bg-gradient-to-br from-green-100 to-green-50 rounded-lg border border-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-green-600 mb-2">
                        98%
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">
                        Satisfaction
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Powerful features designed for modern queue management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Real-Time Updates",
                description:
                  "Instant queue position updates keep customers informed every second.",
                gradient: "from-purple-100 to-purple-50",
                borderColor: "border-purple-200",
                textColor: "text-purple-700",
              },
              {
                icon: "🎯",
                title: "Smart Assignment",
                description:
                  "AI-powered service allocation optimizes wait times and resource usage.",
                gradient: "from-blue-100 to-blue-50",
                borderColor: "border-blue-200",
                textColor: "text-blue-700",
              },
              {
                icon: "📊",
                title: "Advanced Analytics",
                description:
                  "Detailed insights into customer patterns and peak hour trends.",
                gradient: "from-green-100 to-green-50",
                borderColor: "border-green-200",
                textColor: "text-green-700",
              },
              {
                icon: "🔔",
                title: "Smart Notifications",
                description:
                  "Automated SMS and push alerts keep customers engaged.",
                gradient: "from-yellow-100 to-yellow-50",
                borderColor: "border-yellow-200",
                textColor: "text-yellow-700",
              },
              {
                icon: "🛡️",
                title: "Enterprise Security",
                description:
                  "Bank-level encryption protecting all customer data.",
                gradient: "from-red-100 to-red-50",
                borderColor: "border-red-200",
                textColor: "text-red-700",
              },
              {
                icon: "🌐",
                title: "Multi-Branch Support",
                description:
                  "Manage unlimited locations from one powerful dashboard.",
                gradient: "from-indigo-100 to-indigo-50",
                borderColor: "border-indigo-200",
                textColor: "text-indigo-700",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className={`group relative p-8 bg-gradient-to-br ${feature.gradient} rounded-xl border-2 ${feature.borderColor} hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className={`text-xl font-bold ${feature.textColor} mb-3`}>
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-r from-slate-100 to-purple-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              How Queueflex Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to transform your customer experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                number: "1",
                title: "Customers Join Queue",
                description:
                  "Clients book their spot instantly with our mobile-friendly interface. No apps to download.",
              },
              {
                number: "2",
                title: "Real-Time Tracking",
                description:
                  "They see their exact position, estimated wait time, and get notified when it's almost their turn.",
              },
              {
                number: "3",
                title: "Serve & Analyze",
                description:
                  "Manage service delivery and gain insights from powerful analytics to continuously improve.",
              },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-xl border-2 border-slate-200 p-8 text-center h-full">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-8 h-1 bg-gradient-to-r from-purple-600 to-blue-600 transform translate-x-4"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Built for Every Business
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From healthcare to retail, Queueflex serves businesses of all
              sizes
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Link
              href="/client/Booking"
              className="group relative p-12 bg-white rounded-2xl border-2 border-slate-200 hover:border-purple-300 transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-6">👥</div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  For Customers
                </h3>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  Book services instantly, skip the hassle of waiting in line,
                  and get real-time updates on your position.
                </p>
                <div className="flex items-center text-purple-600 font-bold group-hover:gap-3 gap-2 transition-all">
                  Explore Features
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>

            <Link
              href="/provider/dashboard"
              className="group relative p-12 bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-300 transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative z-10">
                <div className="text-6xl mb-6">🏢</div>
                <h3 className="text-3xl font-bold text-slate-900 mb-4">
                  For Providers
                </h3>
                <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                  Manage operations efficiently with powerful tools to optimize
                  service delivery and boost customer satisfaction.
                </p>
                <div className="flex items-center text-blue-600 font-bold group-hover:gap-3 gap-2 transition-all">
                  Open Dashboard
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-6 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Customer Experience?
          </h2>
          <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
            Join thousands of businesses revolutionizing how they serve
            customers. Start your free trial today.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-purple-700 font-bold rounded-lg hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 shadow-xl"
          >
            Start Free Trial
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
          <p className="text-sm text-purple-100 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Queueflex
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                The modern queue management solution for businesses that care
                about customer experience.
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
                links: ["Documentation", "API Docs", "Support", "Status"],
              },
            ].map((column, i) => (
              <div key={i}>
                <h4 className="text-slate-900 font-bold mb-4">
                  {column.title}
                </h4>
                <ul className="space-y-2">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a
                        href="#"
                        className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-600 text-sm">
              © 2026 Queueflex. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
