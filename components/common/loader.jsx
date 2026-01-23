"use client";

import { cn } from "@/lib/utils";

// Pulse Dots Animation
function PulseDots() {
  return (
    <div className="flex gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// Bouncing Dots Animation
function BouncingDots() {
  return (
    <div className="flex gap-2 items-end h-8">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-purple-600 rounded-full"
          style={{
            animation: "bounce 0.6s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Wave Bars Animation
function WaveBars() {
  return (
    <div className="flex gap-1 items-center h-8">
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="w-1.5 bg-purple-600 rounded-full"
          style={{
            animation: "wave 1s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
            height: "8px",
          }}
        />
      ))}
    </div>
  );
}

// Circle Progress Animation
function CircleProgress() {
  return (
    <div className="relative w-12 h-12">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          className="text-purple-200"
        />
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeDasharray="125.6"
          className="text-purple-600"
          style={{
            animation: "circleProgress 1.5s ease-in-out infinite",
          }}
        />
      </svg>
    </div>
  );
}

// Book Pages Flip Animation (BookHushly themed)
function BookFlip() {
  return (
    <div className="relative w-16 h-12">
      <div className="absolute inset-0 flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute w-10 h-12 bg-purple-600 rounded-r-md origin-left"
            style={{
              animation: "flipPage 1.5s ease-in-out infinite",
              animationDelay: `${i * 0.3}s`,
              opacity: 0.3 + i * 0.3,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Orbit Animation
function Orbit() {
  return (
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-purple-200" />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="absolute w-3 h-3 bg-purple-600 rounded-full"
          style={{
            animation: "orbit 1.5s linear infinite",
            animationDelay: `${i * 0.5}s`,
            top: "50%",
            left: "50%",
            marginTop: "-6px",
            marginLeft: "-6px",
          }}
        />
      ))}
    </div>
  );
}

// Typing Dots Animation
function TypingDots() {
  return (
    <div className="flex gap-1.5">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 bg-purple-600 rounded-full"
          style={{
            animation: "typing 1.4s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

// Grid Pulse Animation
function GridPulse() {
  return (
    <div className="grid grid-cols-3 gap-1.5 w-12">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div
          key={i}
          className="w-3 h-3 bg-purple-600 rounded-sm"
          style={{
            animation: "gridPulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

const animations = {
  dots: PulseDots,
  bounce: BouncingDots,
  wave: WaveBars,
  circle: CircleProgress,
  book: BookFlip,
  orbit: Orbit,
  typing: TypingDots,
  grid: GridPulse,
};

export default function Loading({
  text = "Loading...",
  animation = "dots",
  size = "md",
  fullScreen = false,
  overlay = false,
  className,
}) {
  const AnimationComponent = animations[animation] || PulseDots;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "min-h-screen",
        className,
      )}
    >
      <AnimationComponent />
      {text && (
        <p className={cn("font-medium text-gray-700", sizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

// Individual animation exports for more control
export const LoadingDots = ({ className }) => (
  <div className={className}>
    <PulseDots />
  </div>
);

export const LoadingBounce = ({ className }) => (
  <div className={className}>
    <BouncingDots />
  </div>
);

export const LoadingWave = ({ className }) => (
  <div className={className}>
    <WaveBars />
  </div>
);

export const LoadingCircle = ({ className }) => (
  <div className={className}>
    <CircleProgress />
  </div>
);

export const LoadingBook = ({ className }) => (
  <div className={className}>
    <BookFlip />
  </div>
);

export const LoadingOrbit = ({ className }) => (
  <div className={className}>
    <Orbit />
  </div>
);

export const LoadingTyping = ({ className }) => (
  <div className={className}>
    <TypingDots />
  </div>
);

export const LoadingGrid = ({ className }) => (
  <div className={className}>
    <GridPulse />
  </div>
);
