"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Download, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"

interface ZoneCalculationsProps {
  plotData: any
}

const zoningData: any = {
  commercial: {
    12: { far: 1.75, coverage: 75 },
    18: { far: 2.5, coverage: 65 },
    24: { far: 3.0, coverage: 60 },
    30: { far: 3.25, coverage: 50 },
    40: { far: 3.35, coverage: 50 },
  },
  residential_main: {
    12: { far: 1.75, coverage: 75 },
    18: { far: 2.0, coverage: 70 },
    24: { far: 2.25, coverage: 65 },
    30: { far: 2.5, coverage: 60 },
    40: { far: 2.5, coverage: 60 },
  },
  residential_mixed: {
    12: { far: 2.0, coverage: 65 },
    18: { far: 2.5, coverage: 60 },
    24: { far: 2.75, coverage: 55 },
    30: { far: 3.0, coverage: 50 },
    40: { far: 3.0, coverage: 50 },
  },
}

const setbackBands = [
  { minHeight: 11.5, maxHeight: 15, setback: 5.0 },
  { minHeight: 15, maxHeight: 18, setback: 6.0 },
  { minHeight: 18, maxHeight: 21, setback: 7.0 },
  { minHeight: 21, maxHeight: 24, setback: 8.0 },
  { minHeight: 24, maxHeight: 27, setback: 9.0 },
  { minHeight: 27, maxHeight: 30, setback: 10.0 },
  { minHeight: 30, maxHeight: 35, setback: 11.0 },
  { minHeight: 35, maxHeight: 40, setback: 12.0 },
  { minHeight: 40, maxHeight: 45, setback: 13.0 },
  { minHeight: 45, maxHeight: 50, setback: 14.0 },
  { minHeight: 50, maxHeight: 100, setback: 16.0 },
]

function calculateBuildableArea(siteArea: number, plotWidth: number, plotDepth: number, setback: number) {
  const innerWidth = Math.max(0, plotWidth - 2 * setback)
  const innerDepth = Math.max(0, plotDepth - 2 * setback)
  if (innerWidth <= 0 || innerDepth <= 0) return 0
  return innerWidth * innerDepth
}

export function ZoneCalculations({ plotData }: ZoneCalculationsProps) {
  const [scenarios, setScenarios] = useState<any[]>([])
  const [optimalScenario, setOptimalScenario] = useState<any>(null)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    if (!plotData) {
      setScenarios([])
      setOptimalScenario(null)
      setSummary(null)
      return
    }

    const { zoneType, roadWidth, siteArea, plotWidth, plotDepth, floorHeights } = plotData

    // Get zoning parameters
    const zoning = zoningData[zoneType][roadWidth]
    const farAllowed = zoning.far
    const coveragePct = zoning.coverage
    const coverageArea = siteArea * (coveragePct / 100)

    // Generate all scenarios
    const allScenarios: any[] = []
    for (const setbackBand of setbackBands) {
      for (const floorHeight of floorHeights) {
        const maxHeight = setbackBand.maxHeight
        const setback = setbackBand.setback
        const maxFloors = Math.floor(maxHeight / floorHeight)
        const buildableArea = calculateBuildableArea(siteArea, plotWidth, plotDepth, setback)
        const setbackAreaLoss = ((siteArea - buildableArea) / siteArea) * 100
        const totalFarArea = buildableArea * maxFloors
        const achievedFar = siteArea > 0 ? totalFarArea / siteArea : 0
        const farUtilization = (achievedFar / farAllowed) * 100
        const heightAchieved = maxFloors * floorHeight

        allScenarios.push({
          setback,
          maxHeight,
          floorHeight,
          maxFloors,
          setbackAreaLoss,
          buildableArea,
          coverageArea,
          totalFarArea,
          farAllowed,
          achievedFar,
          farUtilization,
          heightAchieved,
          isFeasible: achievedFar <= farAllowed && heightAchieved <= maxHeight,
        })
      }
    }

    // Find optimal
    let optimal = null
    let maxUtilization = 0
    for (const s of allScenarios) {
      if (s.isFeasible && s.farUtilization > maxUtilization) {
        maxUtilization = s.farUtilization
        optimal = s
      }
    }

    setScenarios(allScenarios)
    setOptimalScenario(optimal)
    setSummary({
      zoneType,
      roadWidth,
      farAllowed,
      coveragePct,
      coverageArea,
    })
  }, [plotData])

  const downloadExcel = () => {
    let csv =
      "Setback (m),Max Height (m),Floor Height (m),Max Floors,Setback Area Loss (%),Buildable Area (sqm),Coverage Area (sqm),Total FAR Area (sqm),FAR Allowed,Achieved FAR,FAR Utilization (%),Height Achieved (m),Status\n"

    scenarios.forEach((s) => {
      csv += `${s.setback.toFixed(1)},${s.maxHeight.toFixed(1)},${s.floorHeight.toFixed(2)},${s.maxFloors},${s.setbackAreaLoss.toFixed(1)},${s.buildableArea.toFixed(0)},${s.coverageArea.toFixed(0)},${s.totalFarArea.toFixed(0)},${s.farAllowed.toFixed(2)},${s.achievedFar.toFixed(2)},${s.farUtilization.toFixed(1)},${s.heightAchieved.toFixed(1)},${s.isFeasible ? "Feasible" : "Over FAR"}\n`
    })

    const link = document.createElement("a")
    link.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
    link.download = "FAR_Feasibility_Study.csv"
    link.click()
  }

  if (!plotData) {
    return (
      <Card className="p-6 shadow-lg bg-white/95 backdrop-blur">
        <div className="text-center text-gray-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-sm">
            Draw a plot, enter parameters, and click Calculate to generate all feasible building options
          </p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="p-6 shadow-lg bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-900">FAR & Setback Feasibility Calculator</h2>
          <Badge className="bg-blue-600 text-white">RMP 2015</Badge>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Zone</p>
              <p className="text-sm font-bold text-blue-900">{summary.zoneType.replace("_", " ").toUpperCase()}</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-xs text-gray-600 mb-1">Road Width</p>
              <p className="text-sm font-bold text-blue-900">{summary.roadWidth}m</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 mb-1">FAR Allowed</p>
              <p className="text-sm font-bold text-green-600">{summary.farAllowed.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Ground Coverage</p>
              <p className="text-sm font-bold text-green-600">{summary.coveragePct}%</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-xs text-gray-600 mb-1">Max Coverage Area</p>
              <p className="text-sm font-bold text-green-600">{summary.coverageArea.toFixed(0)} sqm</p>
            </div>
          </div>
        )}

        {optimalScenario && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <p className="text-sm font-semibold mb-1">Optimal Option:</p>
              <p className="text-lg">
                Setback {optimalScenario.setback.toFixed(1)}m + {optimalScenario.maxFloors} floors (
                {optimalScenario.floorHeight.toFixed(2)}m height per floor) = {optimalScenario.achievedFar.toFixed(2)}{" "}
                FAR ({optimalScenario.farUtilization.toFixed(1)}% utilization)
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Feasibility Table */}
      <Card className="p-6 shadow-lg bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-blue-900">All Feasible Options (Auto-generated)</h3>
          <Button onClick={downloadExcel} size="sm" className="bg-green-600 hover:bg-green-700 gap-2">
            <Download className="w-4 h-4" />
            Download Excel
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-blue-900 text-white">
                <th className="p-2 border border-blue-800 text-left">Setback (m)</th>
                <th className="p-2 border border-blue-800 text-left">Max Height (m)</th>
                <th className="p-2 border border-blue-800 text-left">Floor Height (m)</th>
                <th className="p-2 border border-blue-800 text-left">Max Floors</th>
                <th className="p-2 border border-blue-800 text-left">Setback Loss (%)</th>
                <th className="p-2 border border-blue-800 text-left">Buildable Area (sqm)</th>
                <th className="p-2 border border-blue-800 text-left">Coverage Area (sqm)</th>
                <th className="p-2 border border-blue-800 text-left">Total FAR Area (sqm)</th>
                <th className="p-2 border border-blue-800 text-left">FAR Allowed</th>
                <th className="p-2 border border-blue-800 text-left">Achieved FAR</th>
                <th className="p-2 border border-blue-800 text-left">FAR Util. (%)</th>
                <th className="p-2 border border-blue-800 text-left">Height (m)</th>
                <th className="p-2 border border-blue-800 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, idx) => (
                <tr
                  key={idx}
                  className={
                    s === optimalScenario ? "bg-green-100 font-semibold" : s.isFeasible ? "bg-yellow-50" : "bg-red-50"
                  }
                >
                  <td className="p-2 border border-gray-200">{s.setback.toFixed(1)}</td>
                  <td className="p-2 border border-gray-200">{s.maxHeight.toFixed(1)}</td>
                  <td className="p-2 border border-gray-200">{s.floorHeight.toFixed(2)}</td>
                  <td className="p-2 border border-gray-200">{s.maxFloors}</td>
                  <td className="p-2 border border-gray-200">{s.setbackAreaLoss.toFixed(1)}%</td>
                  <td className="p-2 border border-gray-200">{s.buildableArea.toFixed(0)}</td>
                  <td className="p-2 border border-gray-200">{s.coverageArea.toFixed(0)}</td>
                  <td className="p-2 border border-gray-200">{s.totalFarArea.toFixed(0)}</td>
                  <td className="p-2 border border-gray-200">{s.farAllowed.toFixed(2)}</td>
                  <td className="p-2 border border-gray-200">{s.achievedFar.toFixed(2)}</td>
                  <td className="p-2 border border-gray-200">{s.farUtilization.toFixed(1)}%</td>
                  <td className="p-2 border border-gray-200">{s.heightAchieved.toFixed(1)}</td>
                  <td className="p-2 border border-gray-200">{s.isFeasible ? "✓ Feasible" : "✗ Over FAR"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}