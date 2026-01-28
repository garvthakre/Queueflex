"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AdminApi } from "../../api/config";
import { BookingResponseData } from "../../api/interface";

const Page = () => {
  const [items, setItems] = useState<BookingResponseData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "waiting" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter and search logic
  const filteredItems = items.filter((item) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "waiting" && item.status === "waiting") ||
      (filter === "completed" && item.status === "completed");

    const matchesSearch =
      searchQuery === "" ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.serviceType?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "waiting":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "in_progress":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const stats = {
    total: items.length,
    waiting: items.filter((i) => i.status === "waiting").length,
    completed: items.filter((i) => i.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Link href="/provider/dashboard" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold mb-4 transition-colors group">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Queue Management
            </h1>
            <p className="text-slate-600 font-medium">
              Monitor and manage customer queues in real-time
            </p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Queues</p>
                <p className="text-3xl font-black text-slate-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Waiting</p>
                <p className="text-3xl font-black text-amber-600">{stats.waiting}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Completed</p>
                <p className="text-3xl font-black text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name or service type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === "all"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("waiting")}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === "waiting"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Waiting
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  filter === "completed"
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
        </div>

        {/* Queue Items */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
            <p className="text-slate-600 font-medium">Loading queues...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No queues found</h3>
            <p className="text-slate-600">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "Queue items will appear here as customers book services"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item, index) => (
              <div
                key={item.queue_id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500 opacity-0 animate-[fadeInUp_0.6s_ease-out_forwards]"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Side - Customer Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-lg">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-slate-900 mb-1">
                            {item.name}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-3 text-sm mb-2">
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span className="font-semibold">{item.serviceType}</span>
                            </div>
                            
                            {item.position !== undefined && (
                              <div className="flex items-center gap-1.5 text-slate-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                                </svg>
                                <span className="font-semibold">Position: {item.position}</span>
                              </div>
                            )}
                          </div>

                          {item.purpose && (
                            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 inline-block">
                              <span className="font-semibold text-slate-700">Purpose:</span> {item.purpose}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      {/* Status Badge */}
                      <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border-2 ${getStatusColor(item.status)}`}>
                        {item.status || "Pending"}
                      </span>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(item.queue_id, "completed")}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md text-sm flex items-center gap-2"
                          title="Mark as completed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Complete
                        </button>

                        <button
                          onClick={() => updateStatus(item.queue_id, "waiting")}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md text-sm flex items-center gap-2"
                          title="Mark as waiting"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Waiting
                        </button>

                        <button
                          onClick={() => deleteItem(item.queue_id)}
                          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-all duration-300 text-sm flex items-center gap-2"
                          title="Delete queue item"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;