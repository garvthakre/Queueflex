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
    <div style={{ padding: 16 }}>
      <h2>Provider Dashboard</h2>
      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }}>
          <div>Total bookings</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {loading ? "..." : stats.total_items}
          </div>
        </div>
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }}>
          <div>Waiting</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {loading ? "..." : stats.waiting}
          </div>
        </div>
        <div style={{ padding: 12, border: "1px solid #ccc", borderRadius: 6 }}>
          <div>Completed</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {loading ? "..." : completed}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
