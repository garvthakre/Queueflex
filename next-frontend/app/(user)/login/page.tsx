"use client";
import { NextPage } from "next";
import React from "react";
import { loginData } from "../../api/interface";
import authService from "@/app/services/Authservices";
import { useRouter } from "next/navigation";

interface Props {}

const Page: NextPage<Props> = ({}) => {
  const router = useRouter();
  const [formdata, setformdata] = React.useState<loginData>({
    email: "",
    password: "",
  });
  const [errors, seterrors] = React.useState<loginData>({
    email: "",
    password: "",
  });
  const [isSubmitting, setisSubmitting] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setformdata({
      ...formdata,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setisSubmitting(true);
    try {
      const response = await authService.Login(formdata);
      console.log("Login success:", response);
      console.log("Login form submitted:", formdata);
      if (response.admin == true) {
        router.push("/provider/dashboard");
      } else {
        router.push("/client/Booking");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setisSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto card">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm muted">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Email"
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
            placeholder="Password"
            value={formdata.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex gap-2">
          <button className="btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="px-4 py-2 rounded border"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;
