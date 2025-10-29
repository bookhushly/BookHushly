"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function VendorOnboardingSection() {
  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-purple-50/40 via-white to-transparent">
      {/* Subtle background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-72 h-72 bg-purple-200/30 rounded-full blur-3xl top-0 -left-16"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-96 h-96 bg-purple-300/20 rounded-full blur-3xl bottom-0 right-0"
          animate={{
            x: [0, -40, 20, 0],
            y: [0, 30, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        {/* Text Content */}
        <motion.div
          className="flex-1 space-y-6"
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-4xl lg:text-5xl font-semibold text-gray-900">
            Grow Your Business with{" "}
            <span className="text-purple-600">Bookhushly</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-lg">
            Join thousands of verified vendors reaching more customers daily —
            manage your bookings, payments, and customer relationships all in
            one place.
          </p>

          <ul className="space-y-3 text-gray-700">
            {[
              "Easy onboarding & verification",
              "Instant payments",
              "Dedicated support team",
            ].map((item, i) => (
              <motion.li
                key={i}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
              >
                <span className="inline-block w-2.5 h-2.5 bg-purple-600 rounded-full" />
                {item}
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button className="text-white bg-purple-600 hover:bg-purple-700 rounded-full px-8 py-3 text-lg shadow-md hover:shadow-lg transition">
              Become a Vendor
            </Button>
          </motion.div>
        </motion.div>

        {/* Interactive visual mockup / animation */}
        <motion.div
          className="flex-1 relative flex justify-center items-center"
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            className="bg-white/80 backdrop-blur-md border border-purple-100 rounded-3xl shadow-lg p-6 w-[350px] lg:w-[420px]"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Vendor Dashboard
              </h3>
              <Image
                src="https://images.unsplash.com/photo-1591696331119-b43d3a087e7e?w=800&auto=format&fit=crop&q=60"
                alt="Vendor dashboard mockup"
                width={500}
                height={350}
                className="rounded-2xl object-cover shadow-sm"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
