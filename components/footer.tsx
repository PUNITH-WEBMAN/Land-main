"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import React from "react";

/* ---------- Icons (UNCHANGED) ---------- */
const GitHubIcon = ({ size = 20, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.087-.731.084-.716.084-.716 1.205.082 1.838 1.215 1.838 1.215 1.07 1.835 2.809 1.305 3.492.998.108-.776.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.046.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.594 0-6.492 2.901-6.492 6.492 0 .512.057 1.01.173 1.496-5.405-.271-10.187-2.86-13.387-6.795-.56.96-.883 2.077-.883 3.256 0 2.254 1.147 4.243 2.887 5.419-.847-.025-1.649-.26-2.35-.647-.029.749.208 1.45.746 2.005.679.679 1.574 1.186 2.603 1.307-.207.056-.424.086-.647.086-.159 0-.315-.015-.467-.045.767 2.405 2.989 4.168 5.636 4.217-2.868 2.247-6.49 3.586-10.462 3.586-.681 0-1.35-.039-2.006-.118 3.692 2.378 8.016 3.766 12.692 3.766 15.232 0 23.52-12.69 23.52-23.52 0-.357-.012-.71-.031-1.063z" />
  </svg>
);

const LinkedInIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5z" />
  </svg>
);

/* ---------- Footer ---------- */
export default function Footer() {
  const reduceMotion = useReducedMotion();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#0B0F1A]/90 backdrop-blur-xl">
      {/* ===== Ambient Glows ===== */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-40 left-1/3 h-[420px] w-[420px] rounded-full bg-indigo-600/20 blur-[160px]"
          animate={reduceMotion ? undefined : { opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.05, 0.95] }}
          transition={reduceMotion ? undefined : { duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-48 right-1/4 h-[460px] w-[460px] rounded-full bg-purple-600/20 blur-[180px]"
          animate={reduceMotion ? undefined : { rotate: [0, 25, 0], opacity: [0.18, 0.4, 0.18] }}
          transition={reduceMotion ? undefined : { duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* ===== Content ===== */}
      <div className="relative mx-auto max-w-7xl px-6 py-20">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="flex items-center gap-3">
              <Image src="/logo.png" alt="Plot IQ" width={40} height={40} />
              <span className="text-lg font-semibold text-white">Plot IQ</span>
            </div>
            <p className="mt-4 text-sm text-gray-400 max-w-sm">
              Data-driven land intelligence platform delivering ownership, dispute
              and compliance clarity before you invest.
            </p>
          </motion.div>

          {/* Links */}
          {["Product", "Company", "Resources"].map((title, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <h4 className="mb-4 text-sm font-semibold text-white/90">{title}</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                {["Features", "Pricing", "Docs", "Contact"].map((l) => (
                  <li key={l} className="hover:text-indigo-400 transition-colors cursor-pointer">
                    {l}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Social */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h4 className="mb-4 text-sm font-semibold text-white/90">Follow Us</h4>
            <div className="flex gap-3">
              {[GitHubIcon, TwitterIcon, LinkedInIcon].map((Icon, i) => (
                <motion.button
                  key={i}
                  whileHover={{ scale: 1.1 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 hover:text-indigo-400"
                >
                  <Icon />
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px bg-white/10" />

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-gray-400 md:flex-row">
          <span>© {new Date().getFullYear()} Plot IQ. All rights reserved.</span>
          <span className="text-xs">Built for modern land intelligence</span>
        </div>
      </div>
    </footer>
  );
}
