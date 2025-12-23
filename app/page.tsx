"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Shield,
  FileText,
  Building2,
  Users,
  Globe as GlobeIcon,
  CheckCircle,
} from "lucide-react";

import { Header } from "@/components/header";
import Footer from "@/components/footer";
import MagicButton from "@/components/ui/MagicButton";
import Grid from "@/components/ui/Grid";
import { Spotlight } from "@/components/ui/Spotlight";
import { useAuth } from "@/lib/auth-context";
import { FeatureCard } from "@/components/ui/FeatureCard";

// 🔥 RENAMED IMPORT
// import { World as HeroGlobe } from "@/components/globe/Globe";
import GridGlobe from "@/components/globe/GridGlobe";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const actionLink = mounted && isAuthenticated ? "/search" : "/login";

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-white flex flex-col overflow-hidden">
      {/* Spotlights */}
      <Spotlight
        className="-top-40 -left-32 h-[600px] w-[600px]"
        fill="rgba(99,102,241,0.6)"
      />
      <Spotlight
        className="top-20 left-full h-[500px] w-[500px]"
        fill="rgba(56,189,248,0.4)"
      />
      <Spotlight
        className="top-1/3 left-1/4 h-[500px] w-[500px]"
        fill="rgba(168,85,247,0.35)"
      />

      {/* Header */}
      <Header />

      <main className="flex-1 relative z-10 max-w-7xl mx-auto px-6 py-24">
        {/* HERO TEXT */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 text-indigo-300 px-4 py-2 rounded-full text-sm border border-white/10">
            <CheckCircle className="w-4 h-4" />
            Trusted Land Intelligence Platform
          </div>

          <h1 className="text-5xl md:text-6xl font-bold">
            Plot<span className="text-indigo-400">IQ</span>
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Comprehensive land record verification, GIS mapping, and intelligent
            property insights — built for confident decisions.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
            <Link href={actionLink}>
              <MagicButton
                title="Search Land Records"
                icon={<Search className="w-5 h-5" />}
                position="left"
              />
            </Link>

            <Link href={actionLink}>
              <MagicButton
                title="Get Property Report"
                icon={<FileText className="w-5 h-5" />}
                position="left"
                className="border border-indigo-400 text-indigo-300 bg-transparent hover:bg-indigo-500/10"
              />
            </Link>
          </div>
        </motion.div>
        <div className="">
          <div className="relative top-[-200] h-125 w-full">
            <GridGlobe />
          </div>
        </div>
        {/* 🌍 HERO GLOBE */}
        {/* <div className="relative h-[520px] mt-20">
          <HeroGlobe
            globeConfig={{
              globeColor: "#0B0F1A",
              atmosphereColor: "#6366f1",
              ambientLight: "#ffffff",
              directionalLeftLight: "#ffffff",
              directionalTopLight: "#ffffff",
              pointLight: "#6366f1",
              autoRotate: true,
              autoRotateSpeed: 0.6,
            }}
            data={[]}
          />
        </div> */}

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { label: "Regions Covered", value: "500+" },
            { label: "Properties Verified", value: "1.2Cr+" },
            { label: "Active Users", value: "25,000+" },
            { label: "Disputes Identified", value: "8,500+" },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative overflow-hidden rounded-2xl
                 bg-white/5 backdrop-blur-md
                 border border-white/10
                 p-6 text-left
                 hover:border-white/20"
            >
              {/* Subtle hover glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10"
              />

              <div className="relative z-10 space-y-3">
                {/* <stat.icon className="w-8 h-8 mx-auto text-gray-400" /> */}

                <p className="text-2xl font-semibold tracking-tight text-white">
                  {stat.value}
                </p>

                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* FEATURES */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            {
              image: "/gis.jpg",
              title: "GIS Mapping",
              desc: "Precise plot boundaries with satellite imagery and infrastructure overlays.",
            },
            {
              image: "/report.jpg",
              title: "Dispute Detection",
              desc: "Live litigation checks across courts before you invest.",
            },
            {
              image: "/documents.jpg",
              title: "Complete Reports",
              desc: "Ownership history, EC, zoning, and mutation records in one place.",
            },
          ].map((item, i) => (
            <FeatureCard key={i} {...item} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
