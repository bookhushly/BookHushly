"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const showcaseItems = [
  {
    src: "https://images.unsplash.com/photo-1554995207-c18c203602cb?w=1000&auto=format&fit=crop&q=60",
    alt: "Luxury hotel interior",
    label: "Hotels",
  },
  {
    src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=60",
    alt: "Event celebration hall",
    label: "Events",
  },
  {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&auto=format&fit=crop&q=60",
    alt: "Restaurant interior",
    label: "Food & Restaurants",
  },
  {
    src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=60",
    alt: "Car rental luxury car",
    label: "Car Rentals",
  },
  {
    src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1000&auto=format&fit=crop&q=60",
    alt: "Logistics trucks",
    label: "Logistics",
  },
  {
    src: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1000&auto=format&fit=crop&q=60",
    alt: "Security guards on duty",
    label: "Security",
  },
];

export default function ShowcaseSection() {
  return (
    <section className="relative py-24 bg-gradient-to-br from-purple-50/40 via-white to-transparent overflow-hidden">
      {/* Floating background motion blob */}
      <motion.div
        className="absolute top-1/2 -left-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
        animate={{
          x: [0, 20, -30, 0],
          y: [0, -20, 20, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-semibold text-gray-900">
            Experience the <span className="text-purple-600">Bookhushly</span>{" "}
            Lifestyle
          </h2>
          <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
            From luxury stays to unforgettable events — see what our verified
            vendors have to offer.
          </p>
        </motion.div>

        {/* Image Grid */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.15 },
            },
          }}
        >
          {showcaseItems.map((item, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 },
              }}
              className="relative group overflow-hidden rounded-2xl shadow-sm cursor-pointer"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={500}
                height={400}
                className="object-cover w-full h-64 md:h-72 group-hover:scale-110 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-4 left-4 text-white font-medium text-lg opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-500">
                {item.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
