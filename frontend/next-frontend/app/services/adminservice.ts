import { adminApi } from "../api/config";
import { BookingResponseData, Service } from "../api/interface";

interface Stats {
  total_items: number;
  waiting: number;
  by_service_type?: Record<string, number>;
}

const adminService = {
  getQueueStats: async (): Promise<Stats> => {
    const res = await adminApi.get("/admin/queue/stats");
    return res.data;
  },

  getProviderServices: async (): Promise<Service[]> => {
    const res = await adminApi.get("/provider/services");
    return res.data || [];
  },

  createService: async (data: { name: string; description: string; category: string }): Promise<Service> => {
    const res = await adminApi.post("/provider/services", data);
    return res.data;
  },

  updateService: async (id: string, data: Partial<Service>): Promise<Service> => {
    const res = await adminApi.put(`/provider/services/${id}`, data);
    return res.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await adminApi.delete(`/provider/services/${id}`);
  },

  getProviderQueues: async (): Promise<BookingResponseData[]> => {
    const res = await adminApi.get("/provider/queue/all");
    return res.data || [];
  },

  updateQueueStatus: async (queue_id: string, status: string): Promise<void> => {
    await adminApi.put(`/provider/queue/${queue_id}`, { status });
  },

  deleteQueue: async (queue_id: string): Promise<void> => {
    await adminApi.delete(`/provider/queue/${queue_id}`);
  },
};

export default adminService;