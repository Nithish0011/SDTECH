import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="text-center px-4">
        <p className="text-6xl mb-4">🔍</p>
        <h1 className="text-2xl font-bold text-primary">Page Not Found</h1>
        <p className="text-gray-500 mt-2">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-primary inline-block mt-6">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
