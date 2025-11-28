"use client";

import { useState } from "react";
import { api } from "@/lib/axios";
import { useAuth } from "@/store/authStore";

export default function AppointmentPage() {
  const { token } = useAuth();
  const [form, setForm] = useState({
    service_type: "",
    service_location: "",
    time_slot: ""
  });

  const createAppointment = async () => {
    try {
      const res = await fetch("http://localhost:8000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      alert("Appointment created with ID: " + data.appointment_id);
    } catch {
      alert("Error creating appointment");
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-semibold">Book Appointment</h1>

      <input
        className="block w-full p-2 mt-4 border rounded"
        placeholder="Service Type"
        onChange={(e) => setForm({ ...form, service_type: e.target.value })}
      />
      <input
        className="block w-full p-2 mt-4 border rounded"
        placeholder="Service Location"
        onChange={(e) => setForm({ ...form, service_location: e.target.value })}
      />

      <input
        type="datetime-local"
        className="block w-full p-2 mt-4 border rounded"
        onChange={(e) => setForm({ ...form, time_slot: e.target.value })}
      />

      <button
        className="mt-4 py-2 px-4 bg-blue-600 text-white rounded"
        onClick={createAppointment}
      >
        Submit
      </button>
    </div>
  );
}
