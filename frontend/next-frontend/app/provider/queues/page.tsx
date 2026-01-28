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
      // fetch provider's services to filter queues
      const servicesRes = await AdminApi.get("/provider/services");
      const allServices = servicesRes.data || [];
      const userId = Number(localStorage.getItem("user_id") || 0);
      const myServiceIds = allServices
        .filter((s: any) => Number(s.created_by) === userId)
        .map((s: any) => String(s.service_id));

      // provider-specific endpoint returns only queues for provider services
      const res = await AdminApi.get("/provider/queue/all");
      const allQueues = res.data || [];
      setItems(allQueues);
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
      await AdminApi.put(`/provider/queue/${queue_id}`, { status });
      fetchQueues();
    } catch (err) {
      console.error("[Queues] updateStatus error:", err);
    }
  };

  const deleteItem = async (queue_id: string) => {
    if (!confirm("Delete this queue item?")) return;
    try {
      await AdminApi.delete(`/provider/queue/${queue_id}`);
      fetchQueues();
    } catch (err) {
      console.error("[Queues] deleteItem error:", err);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Queues</h2>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="overflow-x-auto card">
          <table className="w-full table-auto">
            <thead>
              <tr className="text-left text-sm text-gray-600">
                <th className="p-3">Name</th>
                <th className="p-3">Service</th>
                <th className="p-3">Position</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((it) => (
                <tr key={it.queue_id} className="border-t">
                  <td className="p-3">{it.name}</td>
                  <td className="p-3">{it.serviceType}</td>
                  <td className="p-3">{it.position ?? "-"}</td>
                  <td className="p-3">{it.status}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateStatus(it.queue_id, "completed")}
                        className="px-2 py-1 rounded border text-sm"
                      >
                        Mark
                      </button>
                      <button
                        onClick={() => updateStatus(it.queue_id, "waiting")}
                        className="px-2 py-1 rounded border text-sm"
                      >
                        Waiting
                      </button>
                      <button
                        onClick={() => deleteItem(it.queue_id)}
                        className="px-2 py-1 rounded text-sm text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Page;
