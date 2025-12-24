"use client";

import { NextPage } from "next";
import React, { useState } from "react";
import { SignupFormData } from "../../api/interface";
import authService from "../../services/Authservices";

interface Props {}

const Page: NextPage<Props> = () => {
  const [formdata, setformdata] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    is_admin: false,
  });

  const [error, seterror] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setformdata({
      ...formdata,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formdata.name || !formdata.email || !formdata.password || !formdata.confirmPassword) {
      seterror("All fields are required");
      return;
    }

    if (formdata.password !== formdata.confirmPassword) {
      seterror("Passwords do not match");
      return;
    }

    seterror("");

    const { confirmPassword, ...signupPayload } = formdata;
    console.log("Payload:", signupPayload);

    try {
      const response = await authService.Signup(signupPayload);
      console.log("Signup success:", response);
    }catch (err: any) {
  console.error("FULL ERROR:", err);
  seterror(err?.message || "Signup failed");
}

  };

  return (
    <div>
      <h1>SIGNUP</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formdata.name}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formdata.email}
          onChange={handleChange}
          required
        />
        <br />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formdata.password}
          onChange={handleChange}
          required
        />
        <br />
        <input type="checkbox"
          name="isadmin"
          checked={formdata.is_admin}
          onChange={(e) => setformdata({...formdata, is_admin: e.target.checked})}
        /> Admin
        <br
        />
        <br />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formdata.confirmPassword}
          onChange={handleChange}
          required
        />
        <br />

        <button type="submit">Signup</button>

        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default Page;
