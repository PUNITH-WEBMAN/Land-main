"use client"

import type { OwnershipRecord } from "@/lib/mock-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ScrollText,
  ArrowDown,
  User,
  Calendar,
  FileText,
} from "lucide-react"

interface TitleDeedHistoryProps {
  history: OwnershipRecord[]
  isDisputed?: boolean
}

/* ---------------- DARK BADGE COLORS ---------------- */
const transferTypeColors: Record<string, string> = {
  "Sale Deed":
    "bg-emerald-500/15 text-emerald-400 border-emerald-400/30",
  "Gift Deed":
    "bg-purple-500/15 text-purple-400 border-purple-400/30",
  Inheritance:
    "bg-indigo-500/15 text-indigo-400 border-indigo-400/30",
  Partition:
    "bg-orange-500/15 text-orange-400 border-orange-400/30",
  "Government Allotment":
    "bg-slate-500/15 text-slate-300 border-slate-400/30",
}

export function TitleDeedHistory({
  history,
  isDisputed,
}: TitleDeedHistoryProps) {
  return (
    <Card
      className="
        bg-white/5
        backdrop-blur-xl
        border border-white/10
        rounded-2xl
      "
    >
      {/* ---------- HEADER ---------- */}
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2 text-white">
          <div className="p-2 rounded-lg bg-orange-500/15 text-orange-400">
            <ScrollText className="w-4 h-4" />
          </div>
          Title Deed – Ownership History
        </CardTitle>

        {isDisputed && (
          <p className="text-xs text-red-400 font-medium mt-1">
            ⚠ Ownership chain has disputes. Verify thoroughly before transaction.
          </p>
        )}
      </CardHeader>

      {/* ---------- CONTENT ---------- */}
      <CardContent>
        <div className="relative">
          {/* Timeline vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

          <div className="space-y-4">
            {history.map((record, idx) => (
              <div key={idx} className="relative pl-10">
                {/* Timeline dot */}
                <div
                  className={`
                    absolute left-2.5 w-3 h-3 rounded-full
                    border border-white/20
                    ${
                      idx === 0
                        ? "bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,.6)]"
                        : "bg-white/30"
                    }
                  `}
                />

                {/* Card */}
                <div
                  className={`
                    p-4 rounded-xl border
                    ${
                      record.ownerName.includes("DISPUTED")
                        ? "bg-red-500/10 border-red-400/30"
                        : idx === 0
                        ? "bg-orange-500/10 border-orange-400/30"
                        : "bg-white/5 border-white/10"
                    }
                    backdrop-blur-md
                  `}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-white/60" />
                        <span className="font-semibold text-white">
                          {record.ownerName}
                        </span>
                      </div>

                      {record.fatherName !== "-" && (
                        <p className="text-xs text-white/50 ml-6">
                          S/o {record.fatherName}
                        </p>
                      )}
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs ${transferTypeColors[record.transferType]}`}
                    >
                      {record.transferType}
                    </Badge>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1 text-white/60">
                      <Calendar className="w-3 h-3" />
                      <span>{record.acquiredDate}</span>
                    </div>

                    <div className="flex items-center gap-1 text-white/60">
                      <FileText className="w-3 h-3" />
                      <span className="truncate">
                        {record.documentNumber}
                      </span>
                    </div>
                  </div>

                  {/* From owner */}
                  {record.fromOwner && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1 text-xs text-white/50">
                      <ArrowDown className="w-3 h-3" />
                      <span>From: {record.fromOwner}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
