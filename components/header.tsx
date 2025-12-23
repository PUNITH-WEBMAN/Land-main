"use client";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { User, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";

/* ---------------- CENTER SLIDING NAV ---------------- */

type NavState = {
  opacity: number;
  left: number;
  width: number;
};

const centerLinks = [
  { label: "Support", href: "/support" },
  { label: "Services", href: "/services" },
  { label: "Search Records", href: "/search" },
];

function LiquidNav() {
  const [state, setState] = useState<NavState>({
    opacity: 0,
    left: 0,
    width: 0,
  });

  const ref = useRef<HTMLLIElement | null>(null);

  const handleEnter = (e: React.MouseEvent<HTMLLIElement>) => {
    if (!ref.current) return;

    const { width } = e.currentTarget.getBoundingClientRect();
    const left = e.currentTarget.offsetLeft;

    setState({ width, left, opacity: 1 });
  };

  const handleLeave = () =>
    setState((p) => ({ ...p, opacity: 0 }));

  return (
    <ul className="relative flex h-11 items-center gap-2 px-1 backdrop-blur-md">
      {centerLinks.map((item) => (
        <li
          key={item.label}
          ref={ref}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
          className="relative z-10 h-full flex items-center justify-center px-5 cursor-pointer text-sm font-medium text-white mix-blend-difference"
        >
          <Link href={item.href}>{item.label}</Link>
        </li>
      ))}

      <motion.li
        animate={state}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute h-full rounded-full bg-white z-0"
      />
    </ul>
  );
}

/* ---------------- REUSABLE SLIDING BUTTON ---------------- */

function SlidingButton({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const [hover, setHover] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative overflow-hidden px-5 py-2 rounded-full border border-white/20 text-white font-medium mix-blend-difference",
        className
      )}
    >
      <motion.span
        initial={{ x: "-100%" }}
        animate={{ x: hover ? "0%" : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute inset-0 bg-white"
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}

/* ---------------- HEADER ---------------- */

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(true);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    const prev = scrollYProgress.getPrevious() ?? 0;
    const direction = current - prev;
    if (scrollYProgress.get() < 0.05) setVisible(true);
    else setVisible(direction < 0);
  });

  return (
    <AnimatePresence>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: visible ? 0 : -100, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className={cn(
          "fixed top-3 inset-x-0 z-[5000] mx-auto px-6 py-2 md:px-10 rounded-2xl",
          "border border-white/10 shadow-lg max-w-[90vw] md:max-w-[85vw] lg:max-w-[1200px]"
        )}
        style={{
          backdropFilter: "blur(16px) saturate(180%)",
          backgroundColor: "rgba(10, 20, 40, 0.75)",
        }}
      >
        <div className="flex items-center justify-between gap-6">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="PlotIQ Logo"
              width={40}
              height={40}
              className="rounded"
              priority
            />
            <span className="text-sm font-bold text-white">PlotIQ</span>
          </Link>

          {/* CENTER NAV */}
          <div className="hidden md:flex">
            <LiquidNav />
          </div>

          {/* AUTH */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <SlidingButton>
                    <User className="w-4 h-4" />
                    {user?.name}
                  </SlidingButton>
                </Link>

                <SlidingButton onClick={logout} className="border-red-400/40">
                  <LogOut className="w-4 h-4" />
                  Logout
                </SlidingButton>
              </>
            ) : (
              <>
                <Link href="/login">
                  <SlidingButton>Login</SlidingButton>
                </Link>

                <Link href="/signup">
                  <SlidingButton>Sign Up</SlidingButton>
                </Link>
              </>
            )}
          </div>

          {/* MOBILE */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </motion.header>
    </AnimatePresence>
  );
}
