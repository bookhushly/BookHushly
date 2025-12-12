import { memo } from "react";
import Image from "next/image";
import { Check, X, Trash2 } from "lucide-react";
import * as LucideIcons from "lucide-react";

export const StepIndicator = memo(({ steps, currentStep }) => (
  <div className="flex items-center justify-between mb-8">
    {steps.map((step, index) => {
      const Icon = step.icon;
      const isActive = currentStep === step.id;
      const isCompleted = currentStep > step.id;

      return (
        <div key={step.id} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all
                ${isActive ? "bg-purple-600 text-white scale-110" : ""}
                ${isCompleted ? "bg-purple-100 text-purple-600" : ""}
                ${!isActive && !isCompleted ? "bg-gray-100 text-gray-400" : ""}
              `}
            >
              {isCompleted ? (
                <Check className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                isActive
                  ? "text-purple-600"
                  : isCompleted
                    ? "text-gray-700"
                    : "text-gray-400"
              }`}
            >
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-0.5 mx-4 ${
                isCompleted ? "bg-purple-600" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      );
    })}
  </div>
));
StepIndicator.displayName = "StepIndicator";

export const ImagePreview = memo(
  ({ url, index, onRemove, alt = "Preview" }) => (
    <div className="relative group">
      <div className="relative w-full h-24 rounded-lg overflow-hidden">
        <Image
          src={url}
          alt={`${alt} ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          loading="lazy"
          quality={75}
        />
      </div>
      <button
        onClick={() => onRemove(url)}
        type="button"
        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
);
ImagePreview.displayName = "ImagePreview";

export const AmenityButton = memo(
  ({ value, label, icon, isSelected, onToggle }) => {
    const Icon = LucideIcons[icon] || LucideIcons.HelpCircle;

    return (
      <button
        type="button"
        onClick={() => onToggle(value)}
        className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all text-sm
        ${
          isSelected
            ? "border-purple-600 bg-purple-50 text-purple-700"
            : "border-gray-200 hover:border-gray-300 text-gray-600"
        }
      `}
      >
        <Icon className="w-4 h-4" />
        <span className="truncate">{label}</span>
      </button>
    );
  }
);
AmenityButton.displayName = "AmenityButton";

export const SuiteCard = memo(({ suite, onRemove }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
    {suite.image_urls[0] && (
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={suite.image_urls[0]}
          alt={suite.name}
          fill
          className="object-cover"
          sizes="80px"
          loading="lazy"
          quality={75}
        />
      </div>
    )}
    <div className="flex-1">
      <h5 className="font-medium text-gray-900">{suite.name}</h5>
      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
        <span>₦{suite.base_price.toLocaleString()}/night</span>
        <span>•</span>
        <span>{suite.max_occupancy} guests</span>
        {suite.size_sqm && (
          <>
            <span>•</span>
            <span>{suite.size_sqm}m²</span>
          </>
        )}
      </div>
    </div>
    <button
      onClick={() => onRemove(suite.id)}
      type="button"
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
));
SuiteCard.displayName = "SuiteCard";

export const InfoBanner = ({ icon: Icon, title, description }) => (
  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 flex items-start gap-3">
    <Icon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
    <div>
      <h3 className="font-medium text-purple-900">{title}</h3>
      <p className="text-sm text-purple-700 mt-1">{description}</p>
    </div>
  </div>
);
