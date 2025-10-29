"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    value: "hotels",
    label: "Hotels",
    icon: "🏨",
    desc: "Book verified hotels and luxury stays with exclusive Bookhushly deals.",
    image:
      "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&auto=format&fit=crop&q=80",
    alt: "Luxury hotel lobby and reception area",
    span: "col-span-2 row-span-2",
  },
  {
    value: "serviced_apartments",
    label: "Serviced Apartments",
    icon: "🏢",
    desc: "Modern furnished apartments for short or extended stays.",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80",
    alt: "Modern serviced apartment interior",
    span: "col-span-1 row-span-1",
  },
  {
    value: "food",
    label: "Food & Restaurants",
    icon: "🍽️",
    desc: "Discover top restaurants and enjoy curated dining experiences.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    alt: "Restaurant interior with dining tables",
    span: "col-span-1 row-span-1",
  },
  {
    value: "events",
    label: "Events",
    icon: "🎉",
    desc: "Find event centers, book tickets, and plan unforgettable occasions.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    alt: "Event celebration with decorations and lighting",
    span: "col-span-1 row-span-2",
  },
  {
    value: "car_rentals",
    label: "Car Rentals",
    icon: "🚗",
    desc: "Rent verified vehicles and enjoy stress-free mobility.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
    alt: "Luxury car available for rental",
    span: "col-span-1 row-span-1",
  },
  {
    value: "logistics",
    label: "Logistics",
    icon: "🚚",
    desc: "Fast, reliable logistics and delivery services across cities.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    alt: "Logistics and delivery trucks",
    span: "col-span-2 row-span-1",
  },
  {
    value: "security",
    label: "Security",
    icon: "🛡️",
    desc: "Professional and trusted security services for your peace of mind.",
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&auto=format&fit=crop&q=80",
    alt: "Professional security services",
    span: "col-span-1 row-span-1",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Services() {
  return (
    <section className="relative py-24 overflow-hidden bg-white">
      {/* Moving ambient blobs */}
      <div className="absolute top-[-10rem] left-[-10rem] w-[30rem] h-[30rem] bg-blue-300/10 blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-[-10rem] right-[-10rem] w-[30rem] h-[30rem] bg-purple-300/10 blur-[120px] animate-pulse-slow" />

      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Explore Trusted Categories
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from verified providers and premium services that make life
            simpler and more exciting.
          </p>
        </motion.div>

        {/* Masonry grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={{
            show: {
              transition: {
                staggerChildren: 0.15,
              },
            },
          }}
          className="grid grid-cols-2 md:grid-cols-4 auto-rows-[220px] gap-6"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.value}
              variants={fadeUp}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 120 }}
              className={`relative group rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500 ${cat.span}`}
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
              <div className="absolute bottom-0 p-6 text-white">
                <h3 className="text-2xl font-semibold mb-2 drop-shadow-lg">
                  {cat.label}
                </h3>
                <p className="text-sm opacity-90 mb-4">{cat.desc}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="bg-white text-gray-900 rounded-full hover:bg-gray-100 transition"
                >
                  <Link href={`/services?category=${cat.value}`}>
                    Explore <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
