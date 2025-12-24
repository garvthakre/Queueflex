"use client";

import React, { useEffect, useState } from "react";
import { AdminApi } from "../../api/config";

interface Stats {
  total_items: number;
  waiting: number;
  by_service_type?: Record<string, number>;
}

const Page = () => {
  const [stats, setStats] = useState<Stats>({ total_items: 0, waiting: 0 });
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.get("/admin/queue/stats");
      setStats(res.data);
    } catch (err) {
      console.error("[Dashboard] fetchStats error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const completed = Math.max(0, stats.total_items - stats.waiting);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Provider Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-sm muted">Total bookings</div>
          <div className="text-3xl font-bold mt-2">
            {loading ? "..." : stats.total_items}
          </div>
        </div>

        <div className="card text-center">
          <div className="text-sm muted">Waiting</div>
          <div className="text-3xl font-bold mt-2">
            {loading ? "..." : stats.waiting}
          </div>
        </div>

        <div className="card text-center">
          <div className="text-sm muted">Completed</div>
          <div className="text-3xl font-bold mt-2">
            {loading ? "..." : completed}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
