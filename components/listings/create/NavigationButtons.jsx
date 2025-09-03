import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Upload } from "lucide-react";

export default function NavigationButtons({
  step,
  totalSteps,
  prevStep,
  nextStep,
  loading,
}) {
  return (
    <div className="flex justify-between mt-8">
      {step > 1 && (
        <Button
          type="button"
          variant="outline"
          className="rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors px-6 py-3"
          onClick={prevStep}
        >
          Previous
        </Button>
      )}
      {step < totalSteps ? (
        <Button
          type="button"
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-md"
          onClick={nextStep}
        >
          Next
        </Button>
      ) : (
        <Button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 shadow-md disabled:opacity-50"
        >
          {loading ? (
            <LoadingSpinner className="mr-2 h-5 w-5" />
          ) : (
            <Upload className="mr-2 h-5 w-5" />
          )}
          {loading ? "Creating..." : "Create Listing"}
        </Button>
      )}
    </div>
  );
}
