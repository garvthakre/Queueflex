"use client";

import React, { useEffect, useState } from "react";
import { AdminApi } from "../../api/config";
import { BookingResponseData } from "../../api/interface";

const Page = () => {
  const [items, setItems] = useState<BookingResponseData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQueues = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.get("/admin/queue/all");
      setItems(res.data || []);
    } catch (err) {
      console.error("[Queues] fetchQueues error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  const updateStatus = async (queue_id: string, status: string) => {
    try {
      await AdminApi.put(`/admin/queue/${queue_id}`, { status });
      fetchQueues();
    } catch (err) {
      console.error("[Queues] updateStatus error:", err);
    }
  };

  const deleteItem = async (queue_id: string) => {
    if (!confirm("Delete this queue item?")) return;
    try {
      await AdminApi.delete(`/admin/queue/${queue_id}`);
      fetchQueues();
    } catch (err) {
      console.error("[Queues] deleteItem error:", err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2>Queues</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: 8 }}>Name</th>
              <th style={{ textAlign: "left", padding: 8 }}>Service</th>
              <th style={{ textAlign: "left", padding: 8 }}>Position</th>
              <th style={{ textAlign: "left", padding: 8 }}>Status</th>
              <th style={{ textAlign: "left", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.queue_id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: 8 }}>{it.name}</td>
                <td style={{ padding: 8 }}>{it.serviceType}</td>
                <td style={{ padding: 8 }}>{it.position ?? "-"}</td>
                <td style={{ padding: 8 }}>{it.status}</td>
                <td style={{ padding: 8 }}>
                  <button
                    onClick={() => updateStatus(it.queue_id, "completed")}
                    style={{ marginRight: 8 }}
                  >
                    Mark Completed
                  </button>
                  <button
                    onClick={() => updateStatus(it.queue_id, "waiting")}
                    style={{ marginRight: 8 }}
                  >
                    Set Waiting
                  </button>
                  <button
                    onClick={() => deleteItem(it.queue_id)}
                    style={{ color: "crimson" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Page;
