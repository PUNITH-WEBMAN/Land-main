"use client"

import { useMemo } from "react"
import type { PropertyData } from "@/lib/mock-data"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  CheckCircle,
  MapPin,
  User,
  FileText,
  Layers,
  Calendar,
  IndianRupee,
  Lock,
  Eye,
  EyeOff,
  Gavel,
  Droplets,
  Zap,
  Route,
  TrendingUp,
} from "lucide-react"
import { motion } from "framer-motion"

interface PropertyReportProps {
  property: PropertyData
}

export function PropertyReport({ property }: PropertyReportProps) {
  const { user, addToWatchlist, removeFromWatchlist } = useAuth()
  const isInWatchlist = user?.watchlist.includes(property.surveyNumber)

  const { randomMarketValue, randomPropertyIndex } = useMemo(() => {
    const minCr = 10000000
    const maxCr = 100000000
    return {
      randomMarketValue: Math.floor(Math.random() * (maxCr - minCr)) + minCr,
      randomPropertyIndex: Math.floor(Math.random() * 70) + 10,
    }
  }, [property.surveyNumber])

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount)

  return (
    <div className="space-y-4">

      {/* STATUS */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl border backdrop-blur-xl ${
          property.isDisputed
            ? "bg-red-500/10 border-red-500/30"
            : "bg-emerald-500/10 border-emerald-500/30"
        }`}
      >
        <div className="flex items-center gap-3">
          {property.isDisputed ? (
            <AlertTriangle className="w-6 h-6 text-red-400" />
          ) : (
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          )}
          <div>
            <h3 className="font-semibold text-white">
              {property.isDisputed ? "Disputed Property" : "Clear Title"}
            </h3>
            <p className="text-sm text-slate-400">
              {property.isDisputed
                ? "This property has active litigation"
                : "No encumbrances or disputes found"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* PROPERTY DETAILS */}
      <Card className="bg-[#0B1220]/80 border border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MapPin className="w-4 h-4 text-[#FF9933]" />
            Property Details
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400">Survey No.</span>
              <p className="font-semibold text-white">{property.surveyNumber}</p>
            </div>
            <div>
              <span className="text-slate-400">Khata No.</span>
              <p className="font-semibold text-white">{property.khataNumber}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-400">Owner:</span>
              <span className="text-white font-medium">{property.ownerName}</span>
            </div>
            <p className="ml-6 text-slate-500 text-xs">
              S/o {property.fatherName}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* LAND INFO */}
      <Card className="bg-[#0B1220]/80 border border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Layers className="w-4 h-4 text-[#FF9933]" />
            Land Information
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-400">Extent</span>
              <p className="font-semibold text-white">
                {property.extent.acres} Acres {property.extent.guntas} Guntas
              </p>
            </div>
            <div>
              <span className="text-slate-400">Soil Type</span>
              <p className="font-semibold text-white">{property.soilType}</p>
            </div>
          </div>

          <div>
            <span className="text-slate-400">Zone</span>
            <p className="font-semibold text-white">{property.zone}</p>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Last Mutation:</span>
            <span className="text-white">{property.mutationDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* VALUATION */}
      <Card className="bg-[#0B1220]/80 border border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <IndianRupee className="w-4 h-4 text-[#FF9933]" />
            Valuation
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(randomMarketValue)}
          </p>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                Property Index
              </span>
              <span className="text-white font-semibold">
                {randomPropertyIndex}%
              </span>
            </div>

            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${randomPropertyIndex}%`,
                  background:
                    randomPropertyIndex > 70
                      ? "linear-gradient(90deg,#f97316,#dc2626)"
                      : randomPropertyIndex > 40
                      ? "linear-gradient(90deg,#22c55e,#f97316)"
                      : "linear-gradient(90deg,#22c55e,#86efac)",
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ACTION */}
      <Button
        className={`w-full ${
          isInWatchlist
            ? "border border-[#FF9933] text-[#FF9933]"
            : "bg-[#FF9933] hover:bg-[#e88a2e] text-black"
        }`}
        onClick={() =>
          isInWatchlist
            ? removeFromWatchlist(property.surveyNumber)
            : addToWatchlist(property.surveyNumber)
        }
      >
        {isInWatchlist ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
        {isInWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
      </Button>
    </div>
  )
}
