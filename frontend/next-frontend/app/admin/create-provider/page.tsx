"use client";

import React, { useState } from "react";
import authService from "../../services/Authservices";

const Page = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await authService.Signup({
        name: form.name,
        email: form.email,
        password: form.password,
        is_admin: true,
      });
      setSuccess("Provider created successfully");
      setForm({ name: "", email: "", password: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err?.message || "Failed to create provider");
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold mb-4">Create Provider</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm muted">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm muted">Email</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            type="email"
            required
          />
        </div>

        <div>
          <label className="text-sm muted">Password</label>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            required
          />
        </div>

        <div>
          <label className="text-sm muted">Confirm</label>
          <input
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            type="password"
            required
          />
        </div>

        <div className="flex gap-2">
          <button className="btn" type="submit">
            Create
          </button>
        </div>

        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">{success}</p>}
      </form>
    </div>
  );
};

export default Page;
