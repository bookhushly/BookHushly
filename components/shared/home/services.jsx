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
    icon: "Hotel",
    desc: "Book verified hotels and luxury stays with exclusive Bookhushly deals.",
    image:
      "https://images.unsplash.com/photo-1535827841776-24afc1e255ac?w=800&auto=format&fit=crop&q=80",
    alt: "Luxury hotel lobby and reception area",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    value: "serviced_apartments",
    label: "Serviced Apartments",
    icon: "Building",
    desc: "Modern furnished apartments for short or extended stays.",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80",
    alt: "Modern serviced apartment interior",
    span: "col-span-1 row-span-1",
  },
  {
    value: "food",
    label: "Food & Restaurants",
    icon: "Restaurant",
    desc: "Discover top restaurants and enjoy curated dining experiences.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
    alt: "Restaurant interior with dining tables",
    span: "col-span-1 row-span-1",
  },
  {
    value: "events",
    label: "Events",
    icon: "Party",
    desc: "Find event centers, book tickets, and plan unforgettable occasions.",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    alt: "Event celebration with decorations and lighting",
    span: "lg:col-span-1 lg:row-span-2",
  },
  {
    value: "car_rentals",
    label: "Car Rentals",
    icon: "Car",
    desc: "Rent verified vehicles and enjoy stress-free mobility.",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80",
    alt: "Luxury car available for rental",
    span: "col-span-1 row-span-1",
  },
  {
    value: "logistics",
    label: "Logistics",
    icon: "Truck",
    desc: "Fast, reliable logistics and delivery services across cities.",
    image:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80",
    alt: "Logistics and delivery trucks",
    span: "lg:col-span-2 lg:row-span-1",
  },
  {
    value: "security",
    label: "Security",
    icon: "Shield",
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
    <section className="relative py-16 md:py-24 bg-white overflow-hidden">
      {/* Subtle ambient blobs – mobile safe */}
      <div className="absolute top-[-10rem] left-[-10rem] w-64 h-64 md:w-96 md:h-96 bg-blue-300/10 blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-[-10rem] right-[-10rem] w-64 h-64 md:w-96 md:h-96 bg-purple-300/10 blur-3xl animate-pulse-slow" />

      <div className="container relative z-10 px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            Explore Trusted Categories
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Choose from verified providers and premium services that make life
            simpler and more exciting.
          </p>
        </motion.div>

        {/* Responsive Masonry Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={{
            show: {
              transition: { staggerChildren: 0.12 },
            },
          }}
          className="
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            auto-rows-[240px] 
            gap-4 
            md:gap-6
          "
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.value}
              variants={fadeUp}
              whileTap={{ scale: 0.98 }} // Mobile tap feedback
              className={`
                relative group rounded-2xl md:rounded-3xl overflow-hidden
                shadow-md hover:shadow-xl transition-all duration-500
                ${cat.span}
                min-h-[240px]
              `}
            >
              <Image
                src={cat.image}
                alt={cat.alt}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  {/* <span className="text-xl md:text-2xl">{cat.icon}</span> */}
                  <h3 className="text-lg md:text-xl font-semibold drop-shadow-md">
                    {cat.label}
                  </h3>
                </div>

                <p className="text-sm md:text-base opacity-90 mb-4 line-clamp-2">
                  {cat.desc}
                </p>

                <Button
                  variant="secondary"
                  size="sm"
                  asChild
                  className="
                    bg-white text-gray-900 rounded-full 
                    hover:bg-gray-100 transition-all
                    text-sm md:text-base px-4 py-2
                  "
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
