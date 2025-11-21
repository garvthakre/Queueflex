"use client";

import { useState } from "react";

export default function BookPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState<number | null>(null);

  async function handleBook() {
    const res = await fetch("http://localhost:8000/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        phone,
        queueId: "main",
      }),
    });

    const data = await res.json();
    setToken(data.tokenNumber);
  }

  return (
    <div className="p-10 max-w-lg mx-auto space-y-4">
      <h1 className="text-3xl font-bold mb-4">Book Your Token</h1>

      <input
        type="text"
        placeholder="Enter Name"
        className="border p-2 w-full"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter Phone"
        className="border p-2 w-full"
        onChange={(e) => setPhone(e.target.value)}
      />

      <button
        onClick={handleBook}
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        Book Token
      </button>

      {token && (
        <div className="text-green-600 text-xl mt-4">
          Your Token Number: <b>{token}</b>
        </div>
      )}
    </div>
  );
}
