"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="p-10">
      <h1 className="text-3xl font-semibold">QueueFlex Dashboard</h1>

      <div className="mt-6 space-y-4">
        <Link href="/appointment" className="block p-4 bg-blue-600 text-white rounded">
          Book Appointment
        </Link>

        <Link href="/queue" className="block p-4 bg-green-600 text-white rounded">
          View Queue Status
        </Link>
      </div>
    </div>
  );
}
