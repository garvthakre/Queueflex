"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import Link from "next/link";

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleSignup = async () => {
    try {
      await api.post("/auth/signup", form);
      alert("Signup successful");
    } catch {
      alert("Error signing up");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white w-96 rounded-2xl shadow">
        <h2 className="text-xl font-semibold">Create Account</h2>

        <input
          className="w-full p-2 mt-4 border rounded"
          placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="w-full p-2 mt-4 border rounded"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="w-full p-2 mt-4 border rounded"
          placeholder="Password"
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          className="w-full mt-5 py-2 bg-blue-600 text-white rounded"
          onClick={handleSignup}
        >
          Signup
        </button>

        <p className="mt-3 text-sm">
          Already have an account?{" "}
          <Link className="text-blue-600" href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}
