"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Users,
  Star,
  Globe,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Zap,
  Shield,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4";
  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl focus:ring-purple-300",
    outline:
      "border border-purple-400/30 text-purple-200 hover:bg-purple-900/30 backdrop-blur-sm focus:ring-purple-300",
  };
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const Badge = ({ children }) => (
  <div className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-full bg-purple-500/10 text-purple-200 border border-purple-400/20 backdrop-blur-sm">
    {children}
  </div>
);

const Hero = () => {
  const heroRef = useRef(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const springConfig = { damping: 20, stiffness: 100 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const glow1X = useTransform(smoothX, [0, 1], ["-10%", "10%"]);
  const glow1Y = useTransform(smoothY, [0, 1], ["-10%", "10%"]);

  const handleMouseMove = useCallback(
    (e) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth);
      mouseY.set(e.clientY / innerHeight);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const features = [
    { icon: CheckCircle2, text: "Verified & Trusted Vendors" },
    { icon: Zap, text: "Instant Booking Confirmation" },
    { icon: Shield, text: "Secure Payment Processing" },
  ];

  const featuredCategories = CATEGORIES.slice(0, 4);

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen text-white flex items-center overflow-hidden bg-gradient-to-br from-purple-950 via-black to-indigo-950"
    >
      {/* Subtle glow animation */}
      <motion.div
        className="absolute top-1/3 left-1/4 w-[28rem] h-[28rem] bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-full blur-3xl"
        style={{ x: glow1X, y: glow1Y }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* Background Image */}
      <Image
        src="/book2.jpg"
        alt="Hospitality background"
        fill
        priority
        quality={90}
        className="object-cover opacity-20"
      />

      <div className="relative z-10 container mx-auto px-6 py-24 md:py-32 grid lg:grid-cols-3 gap-10">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-8">
          <Badge>
            <Sparkles className="w-4 h-4 mr-2" />
            Your Journey, Seamlessly Booked
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Experience{" "}
            <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              Premium
            </span>{" "}
            Services at{" "}
            <span className="underline decoration-purple-400/50 decoration-4 underline-offset-4">
              One Platform
            </span>
          </h1>

          <p className="text-base md:text-lg text-purple-100/90 max-w-2xl leading-relaxed">
            Book hotels, events, food, logistics and more — with trusted vendors
            across Africa.{" "}
            <span className="text-purple-300 font-medium">
              Hospitality, simplified.
            </span>
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 bg-purple-900/20 border border-purple-500/20 rounded-xl p-3"
              >
                <div className="p-2 bg-purple-700/40 rounded-lg">
                  <f.icon className="w-5 h-5 text-purple-200" />
                </div>
                <span className="text-sm text-purple-100">{f.text}</span>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/services">
              <Button variant="primary" size="lg" className="group">
                Explore Services
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" size="lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Section (Categories Grid) */}
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {featuredCategories.map((cat, i) => (
            <Link
              key={cat.value}
              href={`/services?category=${cat.value}`}
              className={`relative block rounded-2xl overflow-hidden group shadow-lg h-40 sm:h-48 ${
                i === 0 ? "col-span-2" : ""
              }`}
            >
              <Image
                src={cat.image}
                alt={cat.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-purple-950/70 via-black/50 to-indigo-900/60 group-hover:from-purple-800/50 transition-all" />
              <div className="absolute bottom-3 left-3">
                <div className="text-3xl mb-1">{cat.icon}</div>
                <h3 className="text-base md:text-lg font-semibold group-hover:text-purple-300 transition-colors">
                  {cat.label}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
