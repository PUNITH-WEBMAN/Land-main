"use client"

import { useState, useEffect, Suspense } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import Footer from "@/components/footer"
import { Card } from "@/components/ui/card"
import { CDPMap } from "@/components/cdp-map"
import { ZoneCalculations } from "@/components/zone-calculations"
import { Layers, Info } from "lucide-react"

function CDPZonesContent() {
  const { isAuthenticated, isReady } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plotData, setPlotData] = useState<any>(null)

  const initialLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined
  const initialLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined
  const initialZoom = searchParams.get("zoom") ? parseInt(searchParams.get("zoom")!) : undefined

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.push("/login")
    }
  }, [isReady, isAuthenticated, router])

  if (!isReady) {
    return null
  }
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Holi background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="holi-blob holi-pink" />
        <div className="holi-blob holi-yellow" />
        <div className="holi-blob holi-green" />
        <div className="holi-blob holi-purple" />
        <div className="holi-blob holi-orange" />
      </div>

      <Header />

      <main className="flex-1 py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Layers className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-blue-900">CDP Zone Mapping & Calculator</h1>
            </div>
            <p className="text-gray-600">
              Draw your plot boundary and get automatic FAR, setback, and building capacity calculations
            </p>
          </div>

          {/* Info Card */}
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-1">How to use:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Search for an address using the search bar on the map</li>
                  <li>Use drawing tools (Freehand or Polygon) to mark your plot boundary</li>
                  <li>Enter zone type, road width, and floor height options</li>
                  <li>Click Calculate to get all feasible building options with FAR analysis</li>
                  <li>Download the complete feasibility study as Excel</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Main Content Grid */}
          <div className="space-y-6">
            {/* Map Section */}
          <Card className="p-4 shadow-lg bg-white/95 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-blue-900">Interactive CDP Map with Search</h2>
                {/* Zone Legend */}
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-500 border border-red-600 rounded"></div>
                    <span className="text-sm text-gray-700">Residential</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-500 border border-blue-600 rounded"></div>
                    <span className="text-sm text-gray-700">Commercial</span>
                  </div>
                </div>
              </div>
              <CDPMap onPlotDataChange={setPlotData} initialLat={initialLat} initialLng={initialLng} initialZoom={initialZoom} />
            </Card>

            {/* Calculations Section */}
            <ZoneCalculations plotData={plotData} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function CDPZonesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <CDPZonesContent />
    </Suspense>
  )
}