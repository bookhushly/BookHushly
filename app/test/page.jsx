"use client";
import React, { useState, useRef, useEffect } from "react";
import {
  Download,
  Move,
  Type,
  Square,
  Maximize2,
  Copy,
  Check,
} from "lucide-react";

const TicketPositionEditor = () => {
  const canvasRef = useRef(null);
  const [image, setImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scale, setScale] = useState(1);
  const [selectedElement, setSelectedElement] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [placeholders, setPlaceholders] = useState({
    listingTitle: {
      x: 72.8,
      y: 110.5,
      fontSize: 30,
      color: [255, 255, 255],
      label: "Event Title",
    },
    ticketType: {
      x: 54.1,
      y: 130.7,
      fontSize: 19,
      color: [255, 255, 255],
      label: "Ticket Type",
    },
    date: {
      x: 53.5,
      y: 142.9,
      fontSize: 19,
      color: [255, 255, 255],
      label: "Date",
    },
    time: {
      x: 53.7,
      y: 153.6,
      fontSize: 19,
      color: [255, 255, 255],
      label: "Time",
    },
    vendorName: {
      x: 333.4,
      y: 173.1,
      fontSize: 10,
      color: [255, 255, 255],
      label: "Vendor Name",
    },
    vendorPhone: {
      x: 342.6,
      y: 179.7,
      fontSize: 12,
      color: [255, 255, 255],
      label: "Vendor Phone",
    },
    qrCode: { x: 469, y: 15.5, size: 64.1, label: "QR Code" },
  });

  const [sampleData, setSampleData] = useState({
    listingTitle: "Summer Music Festival 2025",
    ticketType: "VIP x2, Regular x1",
    date: "Sat, Jun 15",
    time: "7:00 PM",
    vendorName: "EventCo Productions",
    vendorPhone: "+234 123 456 7890",
  });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageLoaded(true);
      updateCanvas(img);
    };
    img.src = "/ticket.jpg";
  }, []);

  useEffect(() => {
    if (imageLoaded && image) {
      updateCanvas(image);
    }
  }, [placeholders, selectedElement, imageLoaded, image, scale]);

  const mmToPx = (mm) => (mm * 96) / 25.4;

  const updateCanvas = (img) => {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    const maxWidth = 900;
    const calculatedScale = maxWidth / img.width;
    setScale(calculatedScale);

    canvas.width = img.width * calculatedScale;
    canvas.height = img.height * calculatedScale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    Object.entries(placeholders).forEach(([key, placeholder]) => {
      const isSelected = selectedElement === key;

      if (key === "qrCode") {
        const x = mmToPx(placeholder.x) * calculatedScale;
        const y = mmToPx(placeholder.y) * calculatedScale;
        const size = mmToPx(placeholder.size) * calculatedScale;

        ctx.strokeStyle = isSelected ? "#a855f7" : "#9333ea";
        ctx.lineWidth = isSelected ? 3 : 2;
        ctx.strokeRect(x, y, size, size);

        ctx.fillStyle = "rgba(147, 51, 234, 0.2)";
        ctx.fillRect(x, y, size, size);

        ctx.fillStyle = "#ffffff";
        ctx.font = `${12 * calculatedScale}px Arial`;
        ctx.textAlign = "center";
        ctx.fillText("QR", x + size / 2, y + size / 2);
      } else {
        const x = mmToPx(placeholder.x) * calculatedScale;
        const y = mmToPx(placeholder.y) * calculatedScale;
        const fontSize = placeholder.fontSize * calculatedScale;

        ctx.font = `bold ${fontSize}px Helvetica`;
        ctx.fillStyle = `rgb(${placeholder.color.join(",")})`;
        ctx.textAlign = "left";
        ctx.fillText(sampleData[key] || placeholder.label, x, y);

        if (isSelected) {
          ctx.strokeStyle = "#a855f7";
          ctx.lineWidth = 2;
          const metrics = ctx.measureText(sampleData[key] || placeholder.label);
          ctx.strokeRect(
            x - 5,
            y - fontSize,
            metrics.width + 10,
            fontSize + 10
          );
        }
      }
    });
  };

  const handleCanvasClick = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let foundElement = null;
    Object.entries(placeholders).forEach(([key, placeholder]) => {
      if (key === "qrCode") {
        const x = mmToPx(placeholder.x) * scale;
        const y = mmToPx(placeholder.y) * scale;
        const size = mmToPx(placeholder.size) * scale;

        if (
          clickX >= x &&
          clickX <= x + size &&
          clickY >= y &&
          clickY <= y + size
        ) {
          foundElement = key;
        }
      } else {
        const x = mmToPx(placeholder.x) * scale;
        const y = mmToPx(placeholder.y) * scale;
        const fontSize = placeholder.fontSize * scale;

        const ctx = canvas.getContext("2d");
        ctx.font = `bold ${fontSize}px Helvetica`;
        const metrics = ctx.measureText(sampleData[key] || placeholder.label);

        if (
          clickX >= x - 5 &&
          clickX <= x + metrics.width + 5 &&
          clickY >= y - fontSize &&
          clickY <= y + 10
        ) {
          foundElement = key;
        }
      }
    });

    setSelectedElement(foundElement);
  };

  const handleMouseDown = (e) => {
    if (selectedElement) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const mmX = ((mouseX / scale) * 25.4) / 96;
    const mmY = ((mouseY / scale) * 25.4) / 96;

    setPlaceholders((prev) => ({
      ...prev,
      [selectedElement]: {
        ...prev[selectedElement],
        x: parseFloat(mmX.toFixed(1)),
        y: parseFloat(mmY.toFixed(1)),
      },
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePlaceholder = (key, field, value) => {
    setPlaceholders((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: parseFloat(value) || 0,
      },
    }));
  };

  const copyToClipboard = (key) => {
    const placeholder = placeholders[key];
    const code =
      key === "qrCode"
        ? `{ x: ${placeholder.x}, y: ${placeholder.y}, size: ${placeholder.size} }`
        : `{ x: ${placeholder.x}, y: ${placeholder.y}, fontSize: ${placeholder.fontSize}, color: [${placeholder.color.join(", ")}] }`;

    navigator.clipboard.writeText(code);
    setCopiedField(key);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const exportConfig = () => {
    const config = Object.entries(placeholders).reduce((acc, [key, value]) => {
      if (key === "qrCode") {
        acc[key] = { x: value.x, y: value.y, size: value.size };
      } else {
        acc[key] = {
          x: value.x,
          y: value.y,
          fontSize: value.fontSize,
          color: value.color,
        };
      }
      return acc;
    }, {});

    const dataStr = JSON.stringify(config, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = "ticket-placeholders.json";

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Ticket Position Editor
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Adjust placeholder positions for your ticket template
              </p>
            </div>
            <button
              onClick={exportConfig}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              Export Config
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Template Preview
                </h2>
                {selectedElement && (
                  <span className="text-sm text-purple-600 font-medium">
                    Selected: {placeholders[selectedElement].label}
                  </span>
                )}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 overflow-auto">
                <canvas
                  ref={canvasRef}
                  onClick={handleCanvasClick}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  className="max-w-full cursor-pointer"
                  style={{ imageRendering: "crisp-edges" }}
                />
              </div>

              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Instructions
                </h3>
                <ul className="text-xs text-gray-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Click on any element to select it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Drag selected elements to reposition them</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>
                      Use the controls panel to fine-tune positions and sizes
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>
                      Copy individual values or export the entire config
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Controls
              </h2>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {Object.entries(placeholders).map(([key, placeholder]) => (
                  <div
                    key={key}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      selectedElement === key
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedElement(key)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-gray-900 text-sm">
                        {placeholder.label}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(key);
                        }}
                        className="p-1 hover:bg-purple-100 rounded transition-colors"
                        title="Copy values"
                      >
                        {copiedField === key ? (
                          <Check className="w-4 h-4 text-purple-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            X (mm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={placeholder.x}
                            onChange={(e) =>
                              updatePlaceholder(key, "x", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Y (mm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={placeholder.y}
                            onChange={(e) =>
                              updatePlaceholder(key, "y", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      {key === "qrCode" ? (
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Size (mm)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={placeholder.size}
                            onChange={(e) =>
                              updatePlaceholder(key, "size", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-xs text-gray-600 block mb-1">
                            Font Size
                          </label>
                          <input
                            type="number"
                            value={placeholder.fontSize}
                            onChange={(e) =>
                              updatePlaceholder(key, "fontSize", e.target.value)
                            }
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sample Text
              </h2>

              <div className="space-y-3">
                {Object.entries(sampleData).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs text-gray-600 block mb-1 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </label>
                    <input
                      type="text"
                      value={value}
                      onChange={(e) =>
                        setSampleData((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketPositionEditor;
