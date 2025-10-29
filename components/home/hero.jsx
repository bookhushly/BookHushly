"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useState, useEffect, useCallback, useRef } from "react";
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

// ===== CUSTOM UI COMPONENTS =====

// Custom Button Component
const Button = ({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 focus:ring-purple-300",
    secondary:
      "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl focus:ring-indigo-300",
    outline:
      "bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/40 backdrop-blur-sm focus:ring-white/30",
    gradient:
      "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/50 focus:ring-purple-300",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Badge Component
const Badge = ({ children, className = "" }) => {
  return (
    <div
      className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-full ${className}`}
    >
      {children}
    </div>
  );
};

// Custom Card Component
const Card = ({ children, className = "", hover = false }) => {
  const baseStyles =
    "bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl transition-all duration-500";
  const hoverStyles = hover ? "hover:shadow-3xl hover:bg-white/10" : "";

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
};

// ===== HERO COMPONENT =====

const Hero = () => {
  const heroRef = useRef(null);

  const stats = [
    {
      value: "10+",
      label: "Initial Partners",
      icon: Users,
      color: "from-purple-500 to-indigo-500",
    },
    {
      value: "100+",
      label: "Early Users",
      icon: Star,
      color: "from-pink-500 to-purple-500",
    },
    {
      value: "2+",
      label: "Cities Launched",
      icon: Globe,
      color: "from-violet-500 to-purple-500",
    },
    {
      value: "24/7",
      label: "Customer Support",
      icon: Award,
      color: "from-fuchsia-500 to-purple-500",
    },
  ];

  const features = [
    {
      icon: CheckCircle2,
      text: "Verified & Trusted Vendors",
    },
    {
      icon: Zap,
      text: "Instant Booking Confirmation",
    },
    {
      icon: Shield,
      text: "Secure Payment Processing",
    },
  ];

  const featuredCategories = CATEGORIES.slice(0, 4);

  // Enhanced animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };

  // Smooth spring-based mouse tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 20, stiffness: 100 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Enhanced parallax transforms
  const glow1X = useTransform(smoothMouseX, [0, 1], ["-15%", "15%"]);
  const glow1Y = useTransform(smoothMouseY, [0, 1], ["-15%", "15%"]);
  const glow2X = useTransform(smoothMouseX, [0, 1], ["15%", "-15%"]);
  const glow2Y = useTransform(smoothMouseY, [0, 1], ["-10%", "20%"]);
  const glow3X = useTransform(smoothMouseX, [0, 1], ["5%", "-10%"]);
  const glow3Y = useTransform(smoothMouseY, [0, 1], ["10%", "-15%"]);

  const handleMouseMove = useCallback(
    (e) => {
      if (!heroRef.current) return;
      const { innerWidth, innerHeight } = window;
      const x = e.clientX / innerWidth;
      const y = e.clientY / innerHeight;
      mouseX.set(x);
      mouseY.set(y);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    const handleLeave = () => {
      mouseX.set(0.5);
      mouseY.set(0.5);
    };
    window.addEventListener("mouseleave", handleLeave);
    return () => window.removeEventListener("mouseleave", handleLeave);
  }, [mouseX, mouseY]);

  // Floating particles animation
  const FloatingParticle = ({ delay, duration, xRange, yRange }) => (
    <motion.div
      className="absolute w-2 h-2 bg-purple-300/40 rounded-full pointer-events-none"
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        x: xRange,
        y: yRange,
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden text-white"
      role="banner"
      aria-label="Hero section"
    >
      {/* Background Image with enhanced overlay */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/book2.jpg"
          alt="Premium hospitality services background"
          fill
          priority
          quality={90}
          className="object-cover"
          sizes="100vw"
        />
        {/* Multi-layer gradient overlay with purple tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/90 via-black/80 to-indigo-950/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 via-transparent to-transparent" />
      </div>

      {/* Enhanced Dynamic Motion Glows - Purple Theme */}
      <motion.div
        className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-purple-500/30 to-indigo-500/30 rounded-full blur-3xl pointer-events-none"
        style={{ x: glow1X, y: glow1Y }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-10 right-10 w-[35rem] h-[35rem] bg-gradient-to-br from-pink-500/30 to-purple-600/30 rounded-full blur-3xl pointer-events-none"
        style={{ x: glow2X, y: glow2Y }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/3 w-[28rem] h-[28rem] bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl pointer-events-none"
        style={{ x: glow3X, y: glow3Y }}
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <FloatingParticle
            key={i}
            delay={i * 1.5}
            duration={12 + i * 2}
            xRange={[Math.random() * 100 - 50, Math.random() * 100 - 50]}
            yRange={[Math.random() * -200 - 100, Math.random() * -100]}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="container relative z-10 py-20 md:py-28 px-4 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          {/* Left Section - Main Content */}
          <motion.div variants={fadeUp} className="lg:col-span-2">
            <Card hover className="p-8 md:p-10 lg:p-12">
              {/* Badge */}
              <motion.div variants={fadeIn}>
                <Badge className="mb-6 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-200 border border-purple-400/30 uppercase tracking-wider backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Your Journey, Seamlessly Booked
                </Badge>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={fadeUp}
                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 leading-[1.1]"
              >
                Experience{" "}
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 bg-clip-text text-transparent">
                  Premium
                </span>{" "}
                <br className="hidden sm:block" />
                Services at{" "}
                <span className="relative inline-block">
                  One Platform
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </span>
              </motion.h1>

              {/* Description */}
              <motion.p
                variants={fadeUp}
                className="text-lg md:text-xl text-purple-50/90 mb-8 max-w-2xl leading-relaxed"
              >
                Book hotels, events, food, logistics and more — with trusted
                vendors across Africa.{" "}
                <span className="text-purple-300 font-semibold">
                  Hospitality, simplified.
                </span>
              </motion.p>

              {/* Features List */}
              <motion.div
                variants={fadeUp}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
              >
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeIn}
                    className="flex items-center gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                      <feature.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-purple-100">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
                <Link href="/services">
                  <Button variant="gradient" size="lg" className="group">
                    Explore Services
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </motion.div>
            </Card>
          </motion.div>

          {/* Right Section - Category Bento Grid */}
          <motion.div
            variants={container}
            className="grid grid-cols-2 gap-4 lg:gap-5 content-start"
          >
            {featuredCategories.map((cat, idx) => (
              <motion.div
                key={cat.value}
                variants={fadeUp}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                whileTap={{ scale: 0.98 }}
                className={idx === 0 ? "col-span-2" : ""}
              >
                <Link
                  href={`/services?category=${cat.value}`}
                  className="relative block rounded-2xl overflow-hidden group shadow-2xl h-48 focus:outline-none focus:ring-4 focus:ring-purple-400/50 transition-all"
                  aria-label={`Browse ${cat.label} services`}
                >
                  {/* Image */}
                  <Image
                    src={cat.image}
                    alt={cat.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {/* Gradient overlay with purple tones */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/60 via-black/50 to-indigo-900/60 group-hover:from-purple-800/40 group-hover:via-black/30 group-hover:to-indigo-800/40 transition-all duration-500" />

                  {/* Shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-300/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  </div>

                  {/* Content */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end">
                    <div className="transform transition-transform duration-300 group-hover:-translate-y-1">
                      <span className="text-3xl md:text-4xl mb-2 block drop-shadow-lg">
                        {cat.icon}
                      </span>
                      <h3 className="text-lg md:text-xl font-bold drop-shadow-lg group-hover:text-purple-300 transition-colors">
                        {cat.label}
                      </h3>
                      <p className="text-xs text-white/80 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore services →
                      </p>
                    </div>
                  </div>

                  {/* Border glow with purple */}
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-purple-400/50 transition-all duration-300 pointer-events-none" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
