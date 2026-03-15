import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 font-bricolage">
      <div className="text-center max-w-md">
        <p className="text-8xl font-bold text-gray-200 leading-none select-none mb-2">
          404
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white w-full sm:w-auto">
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Go home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/services">
              <Search className="h-4 w-4 mr-2" />
              Browse services
            </Link>
          </Button>
        </div>
        <Link
          href="javascript:history.back()"
          className="inline-flex items-center gap-1.5 mt-6 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" />
          Go back
        </Link>
      </div>
    </div>
  );
}
