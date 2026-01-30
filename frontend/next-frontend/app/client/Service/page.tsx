"use client"

import { BookingResponseData } from '@/app/api/interface'
import queueService from '@/app/services/queueservice'
import { NextPage } from 'next'
import { use, useEffect, useState } from 'react'

interface Props {}
//this page is for queuing the services and for booking
const Page: NextPage<Props> = ({}) => {
 const [queues,setqueues]=useState<BookingResponseData[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);

 useEffect(()=>{
  const loadqueue = async()=>{
    try{
      setLoading(true);
      const response = await queueService.Getqueue();
      setqueues(response);
    }catch(error){
      console.error("Error fetching queues:", error);
      setError("Failed to load your queues. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  loadqueue();
},[]);

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'waiting':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'serving':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200';
  }
};

const getStatusIcon = (status?: string) => {
  switch (status?.toLowerCase()) {
    case 'waiting':
      return '⏳';
    case 'serving':
      return '✅';
    case 'completed':
      return '✔️';
    default:
      return '📋';
  }
};

if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">Loading your queues...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-red-100">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Oops!</h2>
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
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            My Queues
          </h1>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Track your service bookings and current positions in the queue
          </p>
        </div>

        {/* Queues Grid */}
        {queues.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">📋</div>
            <h3 className="text-2xl font-semibold text-slate-800 mb-2">No Active Queues</h3>
            <p className="text-slate-600 mb-8">You haven't booked any services yet.</p>
            <a
              href="/client/Booking"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 hover:shadow-lg"
            >
              <span>Book a Service</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {queues.map((queue, index) => (
              <div
                key={queue.queue_id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-indigo-200 group overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-lg">
                        {getStatusIcon(queue.status)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{queue.name}</h3>
                        <p className="text-indigo-100 text-sm">{queue.serviceType}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(queue.status)}`}>
                      {queue.status || 'Pending'}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="space-y-4">
                    {/* Position */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">#</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Your Position</p>
                        <p className="font-semibold text-slate-800">
                          {queue.position ? `#${queue.position}` : 'Not assigned'}
                        </p>
                      </div>
                    </div>

                    {/* Purpose */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-500">Purpose</p>
                        <p className="font-medium text-slate-800">{queue.purpose}</p>
                      </div>
                    </div>

                    {/* Queue ID */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500">Queue ID</p>
                        <p className="font-mono text-sm text-slate-600">{queue.queue_id}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-indigo-200 hover:border-indigo-300 group-hover:shadow-md">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-slate-200">
          <p className="text-slate-500 text-sm">
            Need to book a new service? <a href="/client/Booking" className="text-indigo-600 hover:text-indigo-700 font-medium">Book here</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Page