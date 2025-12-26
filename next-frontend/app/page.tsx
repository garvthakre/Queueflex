import Link from "next/link";

export default function Page() {
  return (
    <section className="text-center py-16">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4">
          Queueflex — Simple Queues, Better Service
        </h1>
        <p className="text-gray-600 mb-6">
          Manage customer flow, reduce wait times, and track bookings with a
          minimal, fast interface.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/signup" className="btn">
            Get Started
          </Link>

          <Link href="/login" className="px-4 py-2 rounded border">
            Log in
          </Link>
        </div>

        <div className="mt-10 text-sm text-gray-500">
          <Link href="/client/Booking" className="mr-4 hover:underline">
            Book a Service
          </Link>
          <Link href="/provider/dashboard" className="hover:underline">
            Provider Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
