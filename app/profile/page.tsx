"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  User,
  Shield,
  Eye,
  History,
  AlertTriangle,
  CheckCircle,
  UploadCloud,
  Trash2,
  Search,
} from "lucide-react"

import { useAuth } from "@/lib/auth-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, removeFromWatchlist } = useAuth()
  const [bio, setBio] = useState("")

  useEffect(() => {
    if (!isAuthenticated) router.push("/login")
    if (user) setBio(user.bio || "")
  }, [isAuthenticated, router, user])

  if (!isAuthenticated || !user) return null

  const disputed = user.searchHistory.filter((s) => s === "99/X").length
  const total = user.searchHistory.length
  const risk = total ? (disputed / total) * 100 : 0

  const riskMeta =
    risk > 50
      ? { label: "High", color: "text-red-400" }
      : risk > 25
      ? { label: "Medium", color: "text-yellow-400" }
      : { label: "Low", color: "text-emerald-400" }

  return (
    <div className="min-h-screen pt-20 bg-[#0b1020] text-white">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid gap-8 md:grid-cols-3"
        >
          {/* LEFT PROFILE CARD */}
          <Card className="col-span-1 text-white rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-28 w-28 border border-white/20">
                <img src={user.avatar || "/avatar-placeholder.png"} />
              </Avatar>

              <Button
                variant="outline"
                className="rounded-full text-white border-white/20 bg-white/5"
              >
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload Avatar
              </Button>

              <div className="text-center">
                <p className="text-lg font-semibold">{user.name}</p>
                <Badge className="mt-1 text-white bg-indigo-500/20 text-indigo-300">
                  {user.role}
                </Badge>
              </div>

              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell something about yourself…"
                className="mt-4 bg-white/5 border-white/30 rounded-2xl"
              />

              <Button className="w-full rounded-full border-white/30 text-black bg-white hover:bg-white/10 hover:text-white">
                Save Profile
              </Button>
            </div>
          </Card>

          {/* RIGHT CONTENT */}
          <div className="col-span-2 space-y-6">
            {/* RISK */}
            <Card className="rounded-3xl border text-white border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <Shield className="h-6 w-6 text-indigo-400" />
                <h3 className="text-lg font-semibold">Buyer Safety Score</h3>
              </div>

              <div className="mt-4 flex items-center gap-6">
                <div className={`text-4xl font-bold ${riskMeta.color}`}>
                  {riskMeta.label}
                </div>
                <p className="text-sm text-white/60">
                  {disputed} of {total} searches are disputed
                </p>
              </div>
            </Card>

            {/* WATCHLIST */}
            <Card className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Eye className="h-5 w-5 text-white" />
                Watchlist
              </h3>

              {user.watchlist.length === 0 ? (
                <p className="text-white">No properties added.</p>
              ) : (
                <div className="space-y-2 text-white">
                  {user.watchlist.map((s) => (
                    <div
                      key={s}
                      className="flex justify-between rounded-xl text-white bg-white/5 px-4 py-2"
                    >
                      <span className="font-mono">{s}</span>
                      <button onClick={() => removeFromWatchlist(s)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* SEARCH HISTORY */}
            <Card className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <h3 className="mb-4 flex items-center gap-2 text-lg text-white font-semibold">
                <History className="h-5 w-5 text-white" />
                Recent Searches
              </h3>

              <div className="space-y-2">
                {user.searchHistory.slice(0, 5).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 text-sm text-white/70"
                  >
                    <Search className="h-4 w-4" />
                    {s}
                    {s === "99/X" && (
                      <Badge className="bg-red-500/20 text-red-300">
                        Disputed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
