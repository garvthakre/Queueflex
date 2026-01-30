"use client";

import { NextPage } from "next";
import { useEffect, useState } from "react";
import { Service } from "../../api/interface";
import queueService from "../../services/queueservice";
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
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ name?: string; purpose?: string }>({});

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await queueService.GetServices();
        setServices(data);
      } catch (error: any) {
        console.error("[GetServices] API Error", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
        });
        setError("Failed to load services. Please check your connection and try again.");
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  const validateForm = () => {
    const errors: { name?: string; purpose?: string } = {};
    if (!name.trim()) errors.name = "Name is required";
    if (!purpose.trim()) errors.purpose = "Purpose is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBooking = async () => {
    if (!selectedService || !validateForm()) return;

    setBookingLoading(true);
    setBookingSuccess(null);
    try {
      const payload: BookingRequestData = {
        service_id: selectedService.id,
        name: name.trim(),
        purpose: purpose.trim(),
      };

      const response = await queueService.Addqueue(payload);
      console.log("Booking success:", response);

      setBookingSuccess(`Successfully booked! Your position: #${response.position}`);
      setSelectedService(null);
      setName("");
      setPurpose("");
      setFormErrors({});

      // Auto-close success message after 3 seconds
      setTimeout(() => setBookingSuccess(null), 3000);
    } catch (err: any) {
      console.error("[AddQueue] Failed:", err);
      setError("Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setFormErrors({});
    setError(null);
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('bank') || name.includes('finance')) return '🏦';
    if (name.includes('health') || name.includes('medical')) return '🏥';
    if (name.includes('customer') || name.includes('support')) return '📞';
    if (name.includes('registration') || name.includes('enrollment')) return '📝';
    return '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error && !selectedService) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Unable to Load Services</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Book a Service
            </h1>
            <p className="text-slate-600 text-lg">
              Choose from our available services and join the queue
            </p>
          </div>
          <button
            onClick={() => router.push("/client/Service")}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 font-medium py-3 px-6 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Queues
          </button>
        </div>

        {/* Success Message */}
        {bookingSuccess && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-fade-in">
            <div className="text-green-500 text-xl">✅</div>
            <p className="text-green-800 font-medium">{bookingSuccess}</p>
            <button
              onClick={() => setBookingSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-indigo-200 group overflow-hidden cursor-pointer"
              onClick={() => handleServiceSelect(service)}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Service Icon */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-center">
                <div className="text-4xl mb-2">{getServiceIcon(service.name)}</div>
                <h3 className="text-xl font-bold text-white mb-1">{service.name}</h3>
                {service.serviceType && (
                  <span className="inline-block bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                    {service.serviceType}
                  </span>
                )}
              </div>

              {/* Service Details */}
              <div className="p-6">
                <p className="text-slate-600 mb-4 leading-relaxed">
                  {service.description || "Get assistance with this service"}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-slate-500">Currently serving</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-800">
                      {service.current_queue_count ?? 0}
                    </p>
                    <p className="text-xs text-slate-500">in queue</p>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] shadow-md hover:shadow-lg">
                  Book This Service
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">No Services Available</h3>
            <p className="text-slate-600 mb-8">There are currently no services available for booking.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Booking Modal */}
        {selectedService && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getServiceIcon(selectedService.name)}</div>
                    <div>
                      <h3 className="text-xl font-bold">Book Service</h3>
                      <p className="text-indigo-100">{selectedService.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedService(null)}
                    className="text-white/70 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <div className="mb-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Current queue length:</span>
                    <span className="font-semibold text-slate-800">{selectedService.current_queue_count ?? 0}</span>
                  </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleBooking(); }} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                        formErrors.name
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      required
                    />
                    {formErrors.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>

                  {/* Purpose Field */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Purpose of Visit *
                    </label>
                    <textarea
                      placeholder="Briefly describe why you're visiting"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none ${
                        formErrors.purpose
                          ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                          : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      required
                    />
                    {formErrors.purpose && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.purpose}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="flex-1 border border-slate-300 text-slate-700 py-3 px-4 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={bookingLoading}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {bookingLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Booking...
                        </div>
                      ) : (
                        'Confirm Booking'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
