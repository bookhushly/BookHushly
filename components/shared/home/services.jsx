"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin, Calendar, Truck, Shield } from "lucide-react";
import { useRef } from "react";

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */
const UPPER = [
  {
    id: "hotels",
    label: "Hotels",
    number: "01",
    desc: "Verified hotel rooms across Lagos, Abuja, Port Harcourt and beyond",
    href: "/services?category=hotels",
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&auto=format&fit=crop&q=80",
    alt: "Grand hotel lobby with high ceilings",
    Icon: MapPin,
    // hero tile — left tall
    className: "col-span-1 row-span-2 md:col-span-2 md:row-span-2",
    sizes: "(max-width: 768px) 100vw, 55vw",
  },
  {
    id: "serviced_apartments",
    label: "Serviced Apartments",
    number: "02",
    desc: "Furnished apartments for short stays or extended relocations",
    href: "/services?category=serviced_apartments",
    image:
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&auto=format&fit=crop&q=80",
    alt: "Modern serviced apartment interior",
    Icon: MapPin,
    className: "col-span-1 row-span-1",
    sizes: "(max-width: 768px) 100vw, 45vw",
  },
  {
    id: "events",
    label: "Events",
    number: "03",
    desc: "Venues, tickets, and event services for every occasion",
    href: "/services?category=events",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
    alt: "Elegant event venue with lighting",
    Icon: Calendar,
    className: "col-span-1 row-span-1",
    sizes: "(max-width: 768px) 100vw, 45vw",
  },
];

const LOWER = [
  {
    id: "logistics",
    label: "Logistics",
    number: "04",
    desc: "Reliable freight and delivery across Nigerian cities",
    href: "/quote-services?tab=logistics",
    image: "/logistics.jpeg",
    alt: "Logistics and delivery vehicles",
    Icon: Truck,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
  {
    id: "security",
    label: "Security",
    number: "05",
    desc: "Professional security personnel for events and premises",
    href: "/quote-services?tab=security",
    image: "/security.jpeg",
    alt: "Professional security personnel",
    Icon: Shield,
    sizes: "(max-width: 768px) 100vw, 50vw",
  },
];

/* ─────────────────────────────────────────────
   ANIMATION VARIANTS
───────────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.05 } },
};

/* ─────────────────────────────────────────────
   UPPER TILE (hero left / portrait right)
───────────────────────────────────────────── */
function UpperTile({ tile, isHero }) {
  return (
    <Link
      href={tile.href}
      className={`group relative overflow-hidden rounded-2xl block ${tile.className} bg-[#0f0d1a]`}
    >
      {/* Photo */}
      <Image
        src={tile.image}
        alt={tile.alt}
        fill
        className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
        sizes={tile.sizes}
      />

      {/* Permanent dark gradient — bottom heavy */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Subtle top vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      {/* Category number — top left watermark */}
      <div className="absolute top-4 left-5 md:top-5 md:left-6">
        <span className="font-mono text-[10px] tracking-[0.25em] text-white/40 select-none">
          {tile.number}
        </span>
      </div>

      {/* Arrow link — top right */}
      <div className="absolute top-4 right-4 md:top-5 md:right-5">
        <span
          className="
            flex items-center justify-center w-8 h-8 rounded-full
            bg-white/10 backdrop-blur-sm border border-white/15
            transition-all duration-300 ease-out
            group-hover:bg-white group-hover:border-white group-hover:scale-110
          "
        >
          <ArrowUpRight
            className="h-3.5 w-3.5 text-white group-hover:text-[#1A0D4D] transition-colors duration-300"
          />
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
        {/* Label — always visible */}
        <h3
          className={`font-bricolage font-semibold text-white leading-tight mb-0 transition-all duration-500 ease-out ${
            isHero
              ? "text-2xl md:text-[1.75rem]"
              : "text-lg md:text-xl"
          }`}
        >
          {tile.label}
        </h3>

        {/* Description — slides up on hover */}
        <div
          className="
            overflow-hidden
            max-h-0 opacity-0
            group-hover:max-h-24 group-hover:opacity-100
            transition-all duration-500 ease-out
            mt-0 group-hover:mt-2.5
          "
        >
          <p className="text-sm text-white/75 leading-relaxed">
            {tile.desc}
          </p>
        </div>

        {/* Animated line separator */}
        <div
          className="
            h-px bg-white/25 mt-3 md:mt-4
            origin-left scale-x-0 group-hover:scale-x-100
            transition-transform duration-500 ease-out delay-75
          "
        />

        {/* CTA text — slides up on hover */}
        <div
          className="
            overflow-hidden
            max-h-0 opacity-0
            group-hover:max-h-12 group-hover:opacity-100
            transition-all duration-500 ease-out delay-100
            mt-0 group-hover:mt-3
          "
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.15em] uppercase text-white/90">
            Explore
            <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   LOWER STRIP (wide cinematic horizontal)
───────────────────────────────────────────── */
function LowerStrip({ tile }) {
  return (
    <Link
      href={tile.href}
      className="group relative overflow-hidden rounded-2xl bg-[#0f0d1a] block"
    >
      {/* Photo */}
      <Image
        src={tile.image}
        alt={tile.alt}
        fill
        className="object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-[1.04]"
        sizes={tile.sizes}
      />

      {/* Dark overlay — stronger on lower strips */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Number watermark — large italic background text */}
      <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-12 pointer-events-none select-none overflow-hidden">
        <span
          className="
            font-fraunces italic text-[7rem] md:text-[10rem] leading-none
            text-white/[0.05] group-hover:text-white/[0.08]
            transition-all duration-700 ease-out
            translate-x-4 group-hover:translate-x-0
          "
        >
          {tile.number}
        </span>
      </div>

      {/* Content — left aligned */}
      <div className="relative z-10 flex flex-col justify-center h-full px-6 md:px-10 py-8 md:py-10">
        {/* Icon badge */}
        <div
          className="
            w-10 h-10 rounded-xl flex items-center justify-center mb-4
            bg-white/10 backdrop-blur-sm border border-white/15
            transition-all duration-300 group-hover:bg-violet-600/80 group-hover:border-violet-500/50
          "
        >
          <tile.Icon className="h-4.5 w-4.5 text-white" style={{ width: "1.125rem", height: "1.125rem" }} />
        </div>

        <h3 className="font-bricolage font-semibold text-white text-xl md:text-2xl mb-2 transition-transform duration-500 group-hover:-translate-y-0.5">
          {tile.label}
        </h3>

        <p
          className="
            text-sm text-white/60 leading-relaxed max-w-sm
            opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
            transition-all duration-400 ease-out delay-75
          "
        >
          {tile.desc}
        </p>

        {/* CTA */}
        <div
          className="
            flex items-center gap-2 mt-0
            opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-hover:mt-4
            transition-all duration-400 ease-out delay-100
          "
        >
          <span className="text-xs font-medium tracking-[0.15em] uppercase text-violet-300">
            Get a quote
          </span>
          <div className="h-px w-8 bg-violet-400/60 transition-all duration-300 group-hover:w-12" />
        </div>
      </div>
    </Link>
  );
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */
export default function Services() {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section ref={sectionRef} className="bg-[#F7F6FA] py-20 md:py-32">
      <div className="container mx-auto px-6 lg:px-10">

        {/* ── Header ── */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="mb-12 md:mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6"
        >
          <motion.div variants={fadeUp} className="max-w-lg">
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.3em] uppercase text-violet-600 mb-5"
            >
              <span className="h-px w-8 bg-violet-500 inline-block" />
              Five categories
            </motion.span>

            <h2 className="text-[clamp(1.9rem,4vw,3rem)] leading-[1.07] font-medium text-[#1A0D4D]">
              <span className="font-fraunces italic">Everything</span>
              <span className="font-bricolage"> you can book</span>
              <br />
              <span className="font-bricolage text-[#1A0D4D]/40">in one place.</span>
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="text-sm text-[#1A0D4D]/50 max-w-xs leading-relaxed md:text-right"
          >
            One platform, five categories — built for how Nigerians
            actually travel, host, and move.
          </motion.p>
        </motion.div>

        {/* ── Upper grid: asymmetric editorial masonry ── */}
        {/*
            Desktop layout:
              [ Hotels (2col × 2row) ] [ Apartments (1col × 1row) ]
                                       [  Events    (1col × 1row)  ]
            Mobile: single column stack
        */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="
            grid gap-3 md:gap-4
            grid-cols-1
            md:grid-cols-3
            md:grid-rows-[320px_320px]
            mb-3 md:mb-4
          "
        >
          {UPPER.map((tile) => (
            <motion.div
              key={tile.id}
              variants={fadeUp}
              className={`${tile.className} min-h-[260px] md:min-h-0`}
            >
              <UpperTile tile={tile} isHero={tile.id === "hotels"} />
            </motion.div>
          ))}
        </motion.div>

        {/* ── Lower strips: two wide horizontal cinematic panels ── */}
        <motion.div
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
        >
          {LOWER.map((tile) => (
            <motion.div
              key={tile.id}
              variants={fadeUp}
              className="h-[200px] md:h-[220px]"
            >
              <LowerStrip tile={tile} />
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
