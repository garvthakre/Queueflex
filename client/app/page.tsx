import Link from "next/link";

export default function Home() {
  return (
    <div className="p-10 space-y-4">
      <Link href="/book" className="text-blue-600 underline">
        Book Token
      </Link>

      <br />

      <Link href="/queue/main" className="text-blue-600 underline">
        View Queue
      </Link>
    </div>
  );
}
