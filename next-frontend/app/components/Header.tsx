"use client";

import Link from "next/link";
import React from "react";

export default function Header() {
  return (
    <header className="w-full border-b bg-white/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-semibold">
          Queueflex
        </Link>

        <nav className="space-x-4 text-sm">
          <Link href="/login" className="px-3 py-2 rounded hover:bg-gray-100">
            Login
          </Link>
          <Link href="/signup" className="px-3 py-2 rounded hover:bg-gray-100">
            Signup
          </Link>
          <Link href="/client/Booking" className="px-3 py-2 rounded hover:bg-gray-100">
            Book
          </Link>
          <Link href="/provider/dashboard" className="px-3 py-2 rounded hover:bg-gray-100">
            Provider
          </Link>
        </nav>
      </div>
    </header>
  );
}
