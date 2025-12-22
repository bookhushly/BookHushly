"use client";

import React from "react";

const gradients = [
  {
    name: "Smooth Dark Purple",
    className: "bg-gradient-to-r from-[#2C003E] via-[#4B0073] to-[#6A00A1]",
    hex: "from: #2C003E, via: #4B0073, to: #6A00A1",
  },
  {
    name: "Deep Royal Purple",
    className: "bg-gradient-to-br from-[#3D0066] via-[#5A00A0] to-[#8C33D3]",
    hex: "from: #3D0066, via: #5A00A0, to: #8C33D3",
  },
  {
    name: "Relaxing Plum Gradient",
    className: "bg-gradient-to-r from-[#2E004F] via-[#5C0077] to-[#8F33B0]",
    hex: "from: #2E004F, via: #5C0077, to: #8F33B0",
  },
  {
    name: "Modern Vibrant Purple",
    className: "bg-gradient-to-br from-[#1F0033] via-[#440066] to-[#7F33CC]",
    hex: "from: #1F0033, via: #440066, to: #7F33CC",
  },
  {
    name: "Elegant Dark Indigo-Purple",
    className: "bg-gradient-to-r from-[#1C003F] via-[#3B0072] to-[#6D33A8]",
    hex: "from: #1C003F, via: #3B0072, to: #6D33A8",
  },
];

const GradientTestPage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Purple Gradient Test Page
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gradients.map((g, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-6 h-48 flex flex-col justify-center items-center ${g.className}`}
          >
            <h2 className="text-xl font-semibold mb-2">{g.name}</h2>
            <p className="text-sm text-purple-200 break-words text-center">
              {g.hex}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(g.hex)}
              className="mt-4 px-4 py-2 bg-white text-purple-700 rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Copy Hex
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GradientTestPage;
