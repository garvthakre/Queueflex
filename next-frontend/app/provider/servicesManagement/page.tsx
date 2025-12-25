"use client";

import React, { useEffect, useState } from "react";
import { AdminApi } from "../../api/config";
import { Service } from "../../api/interface";

const Page = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);

  // add service modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // modal state
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  // fetch services
  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.get("/provider/services");
      const all = res.data || [];
      // provider endpoint already returns services owned by the logged-in provider
      setServices(all);
    } catch (err) {
      console.error("[Services] fetchServices error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // toggle active/inactive
  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await AdminApi.put(`/provider/services/${id}`, { status: nextStatus });
      fetchServices();
    } catch (err) {
      console.error("[Services] toggleStatus error:", err);
    }
  };

  // delete service
  const deleteService = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      await AdminApi.delete(`/provider/services/${id}`);
      fetchServices();
    } catch (err) {
      console.error("[Services] deleteService error:", err);
    }
  };

  // open modal
  const openEditModal = (service: Service) => {
    setEditingService(service);
    setEditName(service.name);
    setEditDescription(service.description || "");
  };

  // save edits
  const saveEdit = async () => {
    if (!editingService) return;

    try {
      await AdminApi.put(`/provider/services/${editingService.service_id}`, {
        name: editName,
        description: editDescription,
      });
      setEditingService(null);
      fetchServices();
    } catch (err) {
      console.error("[Services] saveEdit error:", err);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>Services Management</h2>
        <div>
          <button className="btn" onClick={() => setShowAddModal(true)}>
            Add Service
          </button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {services.map((s) => (
            <div
              key={s.service_id}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                borderRadius: 6,
              }}
            >
              <div style={{ fontWeight: 700 }}>{s.name}</div>
              <div style={{ color: "#555", marginBottom: 8 }}>
                {s.description}
              </div>
              <div>Status: {s.status}</div>

              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => openEditModal(s)}
                  style={{ marginRight: 8 }}
                >
                  Edit
                </button>

                <button
                  onClick={() => toggleStatus(s.service_id, s.status)}
                  style={{ marginRight: 8 }}
                >
                  {s.status === "active" ? "Deactivate" : "Activate"}
                </button>

                <button
                  onClick={() => deleteService(s.service_id)}
                  style={{ color: "crimson" }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT MODAL */}
      {editingService && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 400,
            }}
          >
            <h3>Edit Service</h3>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Service name"
              style={{ width: "100%", marginBottom: 10 }}
            />

            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description"
              style={{ width: "100%", marginBottom: 10 }}
            />

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button onClick={() => setEditingService(null)}>Cancel</button>
              <button onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD SERVICE MODAL */}
      {showAddModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 20,
              borderRadius: 8,
              width: 420,
            }}
          >
            <h3>Add Service</h3>

            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Service name"
              style={{ width: "100%", marginBottom: 10 }}
            />

            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description"
              style={{ width: "100%", marginBottom: 10 }}
            />

            <div
              style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}
            >
              <button onClick={() => setShowAddModal(false)}>Cancel</button>
              <button
                onClick={async () => {
                  try {
                    await AdminApi.post("/provider/services", {
                      name: newName,
                      description: newDescription,
                    });
                    setNewName("");
                    setNewDescription("");
                    setShowAddModal(false);
                    fetchServices();
                  } catch (err) {
                    console.error("[AddService] error:", err);
                  }
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
