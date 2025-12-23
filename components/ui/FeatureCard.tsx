"use client";

import { motion } from "framer-motion";

interface FeatureCardProps {
  title: string;
  desc: string;
  image: string;
}

export function FeatureCard({ title, desc, image }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 20 }}
      className="group relative overflow-hidden rounded-2xl
                 border border-white/10
                 bg-white/5 backdrop-blur-md
                 hover:border-indigo-500/30"
    >
      {/* Smaller Image Section */}
      <div className="relative h-30 overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Soft gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A]/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-lg font-semibold tracking-tight text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm text-white/60 leading-relaxed">
          {desc}
        </p>
      </div>

      {/* Subtle hover glow */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
    </motion.div>
  );
}
