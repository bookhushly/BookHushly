"use client";

import { useState } from "react";
import Loading from "@/components/common/loader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const animations = [
  {
    name: "dots",
    label: "Dots",
    description: "Smooth pulsing dots - subtle and clean",
  },
  {
    name: "bounce",
    label: "Bounce",
    description: "Bouncing dots - playful and energetic",
  },
  { name: "wave", label: "Wave", description: "Wave bars - modern and sleek" },
  {
    name: "circle",
    label: "Circle",
    description: "Circular progress - classic and professional",
  },
  {
    name: "book",
    label: "Book",
    description: "Book pages flipping - BookHushly themed!",
  },
  {
    name: "orbit",
    label: "Orbit",
    description: "Orbiting dots - dynamic and engaging",
  },
  {
    name: "typing",
    label: "Typing",
    description: "Typing dots - perfect for chat contexts",
  },
  {
    name: "grid",
    label: "Grid",
    description: "Grid pulse - sophisticated and geometric",
  },
];

const useCases = [
  { text: "Loading...", animation: "dots", label: "General Purpose" },
  { text: "Processing payment...", animation: "circle", label: "Payment" },
  { text: "Finding available hotels...", animation: "book", label: "Booking" },
  { text: "Searching properties...", animation: "orbit", label: "Search" },
  { text: "Fetching your data...", animation: "wave", label: "Data Loading" },
  { text: "AI is thinking...", animation: "typing", label: "AI/Chat" },
  { text: "Submitting request...", animation: "bounce", label: "Form Submit" },
  { text: "Analyzing requirements...", animation: "grid", label: "Processing" },
];

export default function LoadingShowcase() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedSize, setSelectedSize] = useState("md");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Loading Component Showcase
          </h1>
          <p className="text-gray-600 text-lg">
            8 creative loading animations for your application
          </p>
        </div>

        {/* All Animations Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Animation Styles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {animations.map((anim) => (
              <Card
                key={anim.name}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-center mb-4">
                  <Loading animation={anim.name} text="" />
                </div>
                <h3 className="font-semibold text-center mb-2">{anim.label}</h3>
                <p className="text-xs text-gray-600 text-center">
                  {anim.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* Use Cases */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Real-World Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {useCases.map((useCase, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-purple-600">
                    {useCase.label}
                  </span>
                </div>
                <Loading animation={useCase.animation} text={useCase.text} />
              </Card>
            ))}
          </div>
        </div>

        {/* Size Variations */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Size Variations</h2>
          <Card className="p-6">
            <div className="flex gap-4 mb-8 justify-center">
              {["sm", "md", "lg", "xl"].map((size) => (
                <Button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  variant={selectedSize === size ? "default" : "outline"}
                  className={selectedSize === size ? "bg-purple-600" : ""}
                >
                  {size.toUpperCase()}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {["dots", "circle", "book", "orbit"].map((anim) => (
                <div key={anim} className="flex justify-center">
                  <Loading
                    animation={anim}
                    text={`Size: ${selectedSize}`}
                    size={selectedSize}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Special Features */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Special Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Screen */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Full Screen</h3>
              <p className="text-sm text-gray-600 mb-4">
                Takes up the entire viewport height
              </p>
              <div className="h-64 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
                <Loading
                  animation="book"
                  text="Full screen loading..."
                  fullScreen
                />
              </div>
            </Card>

            {/* Overlay */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Overlay Mode</h3>
              <p className="text-sm text-gray-600 mb-4">
                Fixed overlay with backdrop blur
              </p>
              <Button
                onClick={() => setShowOverlay(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Show Overlay Demo
              </Button>
            </Card>
          </div>
        </div>

        {/* Code Examples */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Quick Start</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Usage</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {`import Loading from '@/components/ui/loading';

<Loading text="Loading..." />
<Loading text="Processing..." animation="circle" />
<Loading text="Please wait..." animation="book" size="lg" />`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">With Overlay</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {`{isLoading && (
  <Loading 
    text="Processing payment..." 
    animation="circle"
    overlay 
  />
)}`}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Full Screen</h3>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  {`if (isLoading) {
  return <Loading text="Loading page..." fullScreen />;
}`}
                </pre>
              </div>
            </div>
          </Card>
        </div>

        {/* Props Reference */}
        <div>
          <h2 className="text-2xl font-semibold mb-6">Props Reference</h2>
          <Card className="p-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-4">Prop</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Default</th>
                  <th className="text-left py-2 px-4">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono">text</td>
                  <td className="py-2 px-4">string</td>
                  <td className="py-2 px-4">"Loading..."</td>
                  <td className="py-2 px-4">Text to display below animation</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono">animation</td>
                  <td className="py-2 px-4">string</td>
                  <td className="py-2 px-4">"dots"</td>
                  <td className="py-2 px-4">
                    Animation style (dots, bounce, wave, circle, book, orbit,
                    typing, grid)
                  </td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono">size</td>
                  <td className="py-2 px-4">string</td>
                  <td className="py-2 px-4">"md"</td>
                  <td className="py-2 px-4">Text size (sm, md, lg, xl)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono">fullScreen</td>
                  <td className="py-2 px-4">boolean</td>
                  <td className="py-2 px-4">false</td>
                  <td className="py-2 px-4">Take up full screen height</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 px-4 font-mono">overlay</td>
                  <td className="py-2 px-4">boolean</td>
                  <td className="py-2 px-4">false</td>
                  <td className="py-2 px-4">
                    Show as fixed overlay with backdrop
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-mono">className</td>
                  <td className="py-2 px-4">string</td>
                  <td className="py-2 px-4">-</td>
                  <td className="py-2 px-4">Additional CSS classes</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>

      {/* Overlay Demo */}
      {showOverlay && (
        <Loading
          text="This is an overlay loading state. Click anywhere to close."
          animation="circle"
          overlay
          onClick={() => setShowOverlay(false)}
        />
      )}
    </div>
  );
}
