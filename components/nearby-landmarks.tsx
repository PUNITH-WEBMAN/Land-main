"use client"

import type React from "react"
import type { NearbyLandmark } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Plane,
  Waves,
  Hospital,
  Train,
  Route,
  School,
  LandPlot,
  ShoppingBag,
  Navigation,
} from "lucide-react"

interface NearbyLandmarksProps {
  landmarks: NearbyLandmark[]
}

/* ---------------- ICONS (unchanged logic) ---------------- */
const landmarkIcons: Record<string, React.ReactNode> = {
  airport: <Plane className="w-5 h-5" />,
  lake: <Waves className="w-5 h-5" />,
  hospital: <Hospital className="w-5 h-5" />,
  railway: <Train className="w-5 h-5" />,
  highway: <Route className="w-5 h-5" />,
  school: <School className="w-5 h-5" />,
  temple: <LandPlot className="w-5 h-5" />,
  market: <ShoppingBag className="w-5 h-5" />,
}

/* ---------------- DARK / GLASS COLORS ---------------- */
const landmarkColors: Record<string, string> = {
  airport: "bg-indigo-500/15 text-indigo-400",
  lake: "bg-cyan-500/15 text-cyan-400",
  hospital: "bg-red-500/15 text-red-400",
  railway: "bg-purple-500/15 text-purple-400",
  highway: "bg-slate-500/15 text-slate-300",
  school: "bg-yellow-500/15 text-yellow-400",
  temple: "bg-orange-500/15 text-orange-400",
  market: "bg-emerald-500/15 text-emerald-400",
}

export function NearbyLandmarks({ landmarks }: NearbyLandmarksProps) {
  return (
    <Card
      className="
        bg-white/5 
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)]
      "
    >
      {/* ---------- HEADER ---------- */}
      <CardHeader className="pb-4">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400">
            <Navigation className="w-4 h-4" />
          </div>
          Nearby Landmarks & Infrastructure
        </CardTitle>
      </CardHeader>

      {/* ---------- CONTENT ---------- */}
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {landmarks.map((landmark, idx) => (
            <div
              key={idx}
              className="
                group
                flex items-center gap-3
                p-3
                rounded-xl
                bg-white/5
                border border-white/10
                hover:border-indigo-400/40
                hover:bg-white/10
                transition-all
                duration-300
              "
            >
              {/* Icon */}
              <div
                className={`
                  w-10 h-10
                  rounded-xl
                  flex items-center justify-center
                  ${landmarkColors[landmark.type]}
                  group-hover:scale-105
                  transition-transform
                `}
              >
                {landmarkIcons[landmark.type]}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {landmark.name}
                </p>

                <div className="flex items-center gap-1 text-xs text-white/60">
                  <span className="font-semibold text-orange-400">
                    {landmark.distance} km
                  </span>
                  <span>•</span>
                  <span>{landmark.direction}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
