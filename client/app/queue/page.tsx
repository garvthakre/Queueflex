"use client";

import { useEffect, useState } from "react";

interface Token {
  tokenNumber: number;
  name: string;
  phone: string;
  status: string;
}

export default function QueuePage({ params }: any) {
  const { id } = params;

  const [tokens, setTokens] = useState<Token[]>([]);

useEffect(() => {
  async function fetchQueue() {
    const res = await fetch(`http://localhost:8000/queue/${id}`);
    const data = await res.json();
    console.log("API returned:", data);

    setTokens(Array.isArray(data) ? data : []);
  }

  fetchQueue();
}, [id]);



  return (
    <div className="p-10 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6">Queue: {id}</h1>

      <div className="space-y-2">
        {tokens.map((t) => (
          <div key={t.tokenNumber} className="border p-3 rounded">
            <p className="font-bold">Token #{t.tokenNumber}</p>
            <p className="text-sm text-gray-600">{t.name}</p>
            <p className="text-sm">{t.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
