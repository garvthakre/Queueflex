import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t mt-12 bg-white/60">
      <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-600">
        © {new Date().getFullYear()} Queueflex — Simple queue management
      </div>
    </footer>
  );
}
