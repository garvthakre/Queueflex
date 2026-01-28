"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminApi, queueApi } from "../../api/config";
import { ServiceAPIResponse } from "../../api/interface";

interface Stats {
  total_items: number;
  waiting: number;
  by_service_type?: Record<string, number>;
}

const Page = () => {
  const [stats, setStats] = useState<Stats>({ total_items: 0, waiting: 0 });
  const [services, setServices] = useState<ServiceAPIResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.get("/admin/queue/stats");
      setStats(res.data);
    } catch (err) {
      console.error("[Admin Dashboard] fetchStats error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchServices = async () => {
    try {
      const res = await queueApi.get<ServiceAPIResponse[]>("/services");
      setServices(res.data || []);
    } catch (err) {
      console.error("[Admin Dashboard] fetchServices error:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchServices();
  }, []);

  const completed = Math.max(0, stats.total_items - stats.waiting);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl  bg-red-400 font-semibold">Admin Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-sm muted">Total bookings (all)</div>
          <div className="text-3xl font-bold mt-2">
            {loading ? "..." : stats.total_items}
          </div>
        </div>

        <div className="card text-center">
          <div className="text-sm muted">Waiting (all)</div>
          <div className="text-3xl font-bold mt-2">
            {loading ? "..." : stats.waiting}
          </div>
        </div>

        <div className="card text-center">
          <div className="text-sm muted">Services</div>
          <div className="text-3xl font-bold mt-2">{services.length}</div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">All Services</h3>
        <div className="mt-2">
          <Link href="/provider/servicesManagement">
            <button className="btn">Add Service</button>
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left">ID</th>
                <th className="text-left">Name</th>
                <th className="text-left">Type</th>
                <th className="text-left">Current Queue</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s) => (
                <tr key={s.service_id}>
                  <td>{s.service_id}</td>
                  <td>{s.name}</td>
                  <td>{s.serviceType || "-"}</td>
                  <td>{s.current_queue_count ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Page;
