"use client";

import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Service } from "../../api/interface";
import queueService from "../../services/queueservice";
import { redirect } from "next/dist/server/api-utils";
import { BookingRequestData } from "@/app/api/interface";
import { useRouter } from "next/navigation";
interface Props {}

const Page: NextPage<Props> = () => {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await queueService.GetServices();
        setServices(data);
      } catch (error: any) {
        if (error.response) {
          console.error("[GetServices] API Error", {
            status: error.response.status,
            data: error.response.data,
            headers: error.response.headers,
          });
        } else if (error.request) {
          console.error("[GetServices] No response from server", {
            request: error.request,
          });
        } else {
          console.error("[GetServices] Unexpected error", error.message);
        }

        throw error;
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);
  const handleBooking = async () => {
    if (!selectedService) return;

    setBookingLoading(true);
    try {
      const payload: BookingRequestData = {
        service_id: selectedService.id,
        name,
        purpose,
      };

      const response = await queueService.Addqueue(payload);
      console.log("Booking success:", response);

      alert(`Booked! Your position: ${response.position}`);

      setSelectedService(null);
      setName("");
      setPurpose("");
    } catch (err) {
      console.error("[AddQueue] Failed:", err);
      alert("Booking failed");
    } finally {
      setBookingLoading(false);
    }
  };
  const redirect = () => {
    router.push("/client/Service");
  };
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Services</h1>
        <button onClick={redirect} className="px-3 py-2 rounded border">
          See my queue
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => (
          <div key={service.id} className="card">
            <h2 className="font-semibold text-lg">{service.name}</h2>
            <p className="text-sm text-gray-600">{service.description}</p>
            <p className="text-sm mt-2">
              Current Queue: {service.current_queue_count ?? 0}
            </p>

            <div className="mt-3">
              <button
                onClick={() => setSelectedService(service)}
                className="btn"
              >
                Book
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedService && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-3">
              Book: {selectedService.name}
            </h3>

            <input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mb-3"
            />
            <input
              type="text"
              placeholder="Purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSelectedService(null)}
                className="flex-1 border rounded py-2"
              >
                Cancel
              </button>
              <button
                disabled={bookingLoading}
                onClick={handleBooking}
                className="flex-1 btn py-2"
              >
                {bookingLoading ? "Booking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
