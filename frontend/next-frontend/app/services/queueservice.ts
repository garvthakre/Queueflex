import { queueApi } from "../api/config";
import {
  BookingResponseData,
  BookingRequestData,
  Service,
  ServiceAPIResponse,
} from "../api/interface";

const queueService = {
  Addqueue: async (data: BookingRequestData): Promise<BookingResponseData> => {
    try {
      const response = await queueApi.post("/queue/add", data);
      return response.data;
    } catch (error: any) {
      throw error || error;
    }
  },

  GetServices: async (): Promise<Service[]> => {
    try {
      const response = await queueApi.get<ServiceAPIResponse[]>("/services");

      return response.data.map((service) => ({
        id: service.service_id,
        service_id: service.service_id,
        name: service.name,
        description: service.description,
        serviceType: service.serviceType,
        current_queue_count: service.current_queue_count,
      }));
    } catch (error: any) {
      throw error || error;
    }
  },

  Getqueue: async (): Promise<BookingResponseData[]> => {
    try {
      const response = await queueApi.get("/queue/get");
      return response.data;
    } catch (error: any) {
      console.error("[GetQueue] Error:", error);
      throw error || error;
    }
  },
};

export default queueService;
