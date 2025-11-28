"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useAuth } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { setToken } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", form);
      setToken(res.data.token);
      router.push("/dashboard");
    } catch {
      alert("Invalid login");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white w-96 rounded-xl shadow">
        <h2 className="text-xl font-semibold">Login</h2>

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
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
}
