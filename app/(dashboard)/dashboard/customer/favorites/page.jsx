import { Heart } from "lucide-react";
import { EmptyState } from "@/components/shared/customer/shared-ui";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FavoritesPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Favorites</h1>
        <p className="text-sm text-gray-500 mt-0.5">Services you've saved</p>
      </div>

      <div className="bg-white border border-purple-100 rounded-2xl">
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart icon on any listing to save it for easy access later."
          actionLabel="Browse Services"
          actionHref="/services"
        />
      </div>
    </div>
  );
}
