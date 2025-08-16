"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Lightweight inline loader for short operations
const InlineLoader = ({ size = "sm", color = "purple" }) => {
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const colorClasses = {
    purple: "border-purple-600",
    white: "border-white",
    gray: "border-gray-600",
  };

  return (
    <div
      className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full animate-spin`}
    />
  );
};

// Enhanced BookHushly Loading with better UX
const BookHushlyLoading = ({ message = "Preparing your experience..." }) => {
  const services = [
    { icon: "🏨", name: "Hotels", delay: 0 },
    { icon: "🚗", name: "Car Rentals", delay: 0.1 },
    { icon: "🏠", name: "Apartments", delay: 0.2 },
    { icon: "🎉", name: "Events", delay: 0.3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 opacity-20">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: 60 + i * 20,
              height: 60 + i * 20,
              left: `${20 + i * 20}%`,
              top: `${30 + i * 10}%`,
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="text-center z-10"
      >
        {/* Logo */}
        <motion.div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Book<span className="text-purple-300">Hushly</span>
          </h1>
        </motion.div>

        {/* Service icons */}
        <div className="flex justify-center space-x-4 mb-8">
          {services.map((service, index) => (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: service.delay, duration: 0.2 }}
              className="text-2xl"
            >
              {service.icon}
            </motion.div>
          ))}
        </div>

        {/* Simple loading indicator */}
        <div className="flex justify-center items-center space-x-2 mb-4">
          <InlineLoader size="md" color="white" />
        </div>

        <motion.p
          className="text-purple-200 text-sm"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </motion.div>
    </div>
  );
};

// Smart Loading Wrapper Component
export const SmartLoadingWrapper = ({
  isLoading,
  children,
  minDisplayTime = 800, // Minimum time to show loader
  delayThreshold = 300, // Only show loader if loading takes longer than this
  loadingComponent: LoadingComponent = BookHushlyLoading,
}) => {
  const [showLoader, setShowLoader] = useState(false);
  const [forceShowLoader, setForceShowLoader] = useState(false);

  useEffect(() => {
    let delayTimer;
    let minDisplayTimer;

    if (isLoading) {
      // Only show loader after delay threshold
      delayTimer = setTimeout(() => {
        setShowLoader(true);
        setForceShowLoader(true);

        // Ensure loader shows for minimum time once displayed
        minDisplayTimer = setTimeout(() => {
          setForceShowLoader(false);
        }, minDisplayTime);
      }, delayThreshold);
    } else {
      // Clear delay timer if loading finishes quickly
      clearTimeout(delayTimer);

      // If loader is already showing, respect minimum display time
      if (!forceShowLoader) {
        setShowLoader(false);
      }
    }

    return () => {
      clearTimeout(delayTimer);
      clearTimeout(minDisplayTimer);
    };
  }, [isLoading, delayThreshold, minDisplayTime, forceShowLoader]);

  // Hide loader when both conditions are met
  useEffect(() => {
    if (!isLoading && !forceShowLoader) {
      setShowLoader(false);
    }
  }, [isLoading, forceShowLoader]);

  return (
    <AnimatePresence mode="wait">
      {showLoader ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <LoadingComponent />
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Skeleton loader for content areas
export const SkeletonLoader = ({ lines = 3, className = "" }) => (
  <div className={`animate-pulse ${className}`}>
    {[...Array(lines)].map((_, i) => (
      <div
        key={i}
        className="h-4 bg-gray-200 rounded mb-3"
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
);

// Progressive loading hook
export const useProgressiveLoading = (loadingStates) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (currentState < loadingStates.length - 1) {
      const timer = setTimeout(() => {
        setCurrentState((prev) => prev + 1);
      }, loadingStates[currentState].duration);

      return () => clearTimeout(timer);
    }
  }, [currentState, loadingStates]);

  return {
    currentState,
    message: loadingStates[currentState]?.message || "",
    isComplete: currentState === loadingStates.length - 1,
  };
};

// Export the inline loader
export { InlineLoader };

// DEFAULT EXPORT - This is what Next.js loading.jsx expects
export default function Loading() {
  return <BookHushlyLoading />;
}
