"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Lock, Headphones } from "lucide-react";
import { useRef } from "react";

export default function CTA() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax depth
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={ref}
      className="relative h-[80vh] flex items-center justify-center overflow-hidden rounded-t-[3rem]"
    >
      {/* Background Image with Parallax */}
      <motion.div style={{ y }} className="absolute inset-0 w-full h-full">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&auto=format&fit=crop&q=80"
            alt="People enjoying premium services"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-6">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-semibold mb-6 leading-tight"
        >
          Start booking verified services today —{" "}
          <span className="text-purple-400">fast, safe, and simple.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          viewport={{ once: true }}
          className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Join thousands of happy users and vendors who trust{" "}
          <span className="text-purple-300 font-medium">Bookhushly</span> to
          power their daily experiences.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            href="/services"
            className="bg-white text-gray-900 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition"
          >
            Explore Services
          </Link>
          <Link
            href="/vendors"
            className="border border-white text-white px-6 py-3 rounded-full font-medium hover:bg-white/10 transition"
          >
            Join as a Vendor
          </Link>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center items-center gap-6 mt-12 text-sm text-gray-300"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-400" />
            Verified Vendors
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-purple-400" />
            Secure Payments
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-400" />
            24/7 Support
          </div>
        </motion.div>
      </div>
    </section>
  );
}
