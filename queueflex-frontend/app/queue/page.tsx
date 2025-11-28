"use client";

import { useEffect, useState } from "react";

export default function QueuePage() {
  const [queue, setQueue] = useState([]);

  const loadQueue = async () => {
    const res = await fetch("http://localhost:8001/queue");
    const data = await res.json();
    setQueue(data);
  };

  useEffect(() => {
    loadQueue();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold">Queue Status</h1>

      <div className="mt-6 space-y-3">
        {queue.map((q: any) => (
          <div key={q.queue_id} className="p-4 bg-gray-100 rounded">
            <p><b>Appointment:</b> {q.appointment_id}</p>
            <p><b>User:</b> {q.user_id}</p>
            <p><b>Position:</b> {q.position}</p>
            <p><b>Status:</b> {q.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
