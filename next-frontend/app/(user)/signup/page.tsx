"use client";

import { NextPage } from "next";
import React, { useState } from "react";
import { SignupFormData } from "../../api/interface";
import authService from "../../services/Authservices";

const Page: NextPage = () => {
  const [formdata, setformdata] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_admin: false,
  });

  const [error, seterror] = useState<string>("");

  // ✅ FIXED handleChange
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformdata((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ ADD handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formdata.password !== formdata.confirmPassword) {
      seterror("Passwords do not match");
      return;
    }

    try {
      await authService.signup(formdata);
      // redirect or success message here
    } catch (err: any) {
      seterror(err.message || "Signup failed");
    }
  };

  // ✅ JSX belongs here
  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold mb-4">Create an account</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm muted">Name</label>
          <input
            type="text"
            name="name"
            value={formdata.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm muted">Email</label>
          <input
            type="email"
            name="email"
            value={formdata.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm muted">Password</label>
          <input
            type="password"
            name="password"
            value={formdata.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="text-sm muted">Confirm</label>
          <input
            type="password"
            name="confirmPassword"
            value={formdata.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isadmin"
            type="checkbox"
            checked={formdata.is_admin}
            onChange={(e) =>
              setformdata({ ...formdata, is_admin: e.target.checked })
            }
          />
          <label htmlFor="isadmin" className="text-sm muted">
            Register as provider
          </label>
        </div>

        <div className="flex gap-2">
          <button className="btn" type="submit">
            Signup
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() => setformdata({
              name: "",
              email: "",
              password: "",
              confirmPassword: "",
              is_admin: false,
            })}
          >
            Cancel
          </button>
        </div>

        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
};

export default Page;
