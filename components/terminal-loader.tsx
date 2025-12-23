"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Terminal, CheckCircle2, Loader2 } from "lucide-react"
import { loadingSteps } from "@/lib/mock-data"

interface TerminalLoaderProps {
  onComplete: () => void
}

export function TerminalLoader({ onComplete }: TerminalLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    if (currentStep >= loadingSteps.length) {
      setTimeout(onComplete, 500)
      return
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep])
      setCurrentStep((prev) => prev + 1)
    }, loadingSteps[currentStep].duration)

    return () => clearTimeout(timer)
  }, [currentStep, onComplete])

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-white/10 bg-[#0B1220]/80 backdrop-blur-xl shadow-2xl">
        {/* Terminal Header */}
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10 bg-[#0E1628]">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF9933]" />
            <div className="w-3 h-3 rounded-full bg-slate-300" />
            <div className="w-3 h-3 rounded-full bg-[#138808]" />
          </div>
          <div className="flex-1 text-center">
            <span className="text-xs text-slate-400 font-mono">
              bhoomi-gis-terminal
            </span>
          </div>
          <Terminal className="w-4 h-4 text-slate-400" />
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-sm space-y-3 min-h-[250px] bg-[#0B1220] text-slate-300">
          <div className="text-slate-500 text-xs mb-4">
            {">"} Initiating Land Record Query...
          </div>

          <AnimatePresence mode="popLayout">
            {loadingSteps.map((step, index) => {
              const isCompleted = completedSteps.includes(index)
              const isActive = currentStep === index && !isCompleted
              const isVisible = index <= currentStep

              if (!isVisible) return null

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : null}

                  <span
                    className={
                      isCompleted
                        ? "text-emerald-400"
                        : isActive
                        ? "text-indigo-400"
                        : "text-slate-500"
                    }
                  >
                    {step.text}
                  </span>

                  {isCompleted && (
                    <span className="text-emerald-400 text-xs ml-auto">
                      OK
                    </span>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>

          {currentStep >= loadingSteps.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 pt-4 border-t border-white/10 text-emerald-400"
            >
              {">"} Query Complete. Rendering GIS Data...
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
