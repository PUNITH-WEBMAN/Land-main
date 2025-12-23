// app/results/page.tsx
"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import { TerminalLoader } from "@/components/terminal-loader";
import { SurveyMap } from "@/components/survey-map";
import { PropertyReport } from "@/components/property-report";
import { NearbyLandmarks } from "@/components/nearby-landmarks";
import { TitleDeedHistory } from "@/components/title-deed-history";
import { getPropertyData, type PropertyData } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isReady } = useAuth();

  const surveyNumber = searchParams.get("survey") || "";
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [surveyLat, setSurveyLat] = useState<number | null>(null);
  const [surveyLng, setSurveyLng] = useState<number | null>(null);

  useEffect(() => {
    if (isReady && !isAuthenticated) router.push("/login");
  }, [isReady, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || !surveyNumber) return;

    const data = getPropertyData(surveyNumber);
    if (!data) return;

    const lastDigit = Number(surveyNumber.slice(-1));
    const isDisputed = !Number.isNaN(lastDigit) && lastDigit >= 5;

    setProperty({
      ...data,
      isDisputed,
      litigationDetails: isDisputed
        ? {
            caseNumber: "OS-2024-892",
            court: "Civil Court, Bangalore Urban",
            reason: "Ancestral Property Claim",
            filingDate: "12 Jan 2024",
            status: "Stay Order Active",
            action: "Transaction Blocked",
          }
        : undefined,
    });
  }, [isAuthenticated, surveyNumber]);

  const handleLoadComplete = useCallback(() => {
    setLoading(false);
  }, []);

  if (!isReady || !isAuthenticated) return null;

  if (!surveyNumber) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center text-white/60">
          No survey number provided
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#0B0F1A] overflow-hidden flex flex-col">
      {/* top padding to prevent navbar overlap on page sections */}
      <div style={{ paddingTop: 20 }} />

      {/* Ambient Orbs */}
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-indigo-500/20 blur-[140px]" />
      <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-cyan-400/20 blur-[140px]" />
      <div className="absolute bottom-20 left-1/4 w-[420px] h-[420px] rounded-full bg-purple-500/20 blur-[140px]" />

      <Header />

      {loading ? (
        <TerminalLoader onComplete={handleLoadComplete} />
      ) : property ? (
        <main className="relative z-10 flex-1 max-w-7xl mx-auto px-4 mt-10 py-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8 flex-wrap gap-6"
          >
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-white">
                  Survey No. {property.surveyNumber}
                </h1>
                <p className="text-sm text-white/50">
                  Property Intelligence Report
                </p>
                <br />
                <Link href="/search">
                  <Button
                    variant="ghost"
                    size="sm"
                    className=" bg-white text-black hover:text-white hover:bg-white/10"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
              </div>
            </div>

            <div className="flex gap-3 mt-16">
              <Link
                href={`/cdp-zones?lat=${(
                  surveyLat ?? property.center[0]
                ).toFixed(6)}&lng=${(surveyLng ?? property.center[1]).toFixed(
                  6
                )}&zoom=18`}
              >
                <Button className=" bg-white text-black hover:text-white hover:bg-white/10">
                  Open CDP Zones
                </Button>
              </Link>

              <Button className=" bg-white text-black hover:text-white hover:bg-white/10">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </motion.div>

          <div
            className={`mb-6 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl ${
              property.isDisputed
                ? "bg-red-500/10 border-red-500/30 text-red-400"
                : "bg-green-500/10 border-green-500/30 text-green-400"
            }`}
          >
            {property.isDisputed ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldCheck className="w-5 h-5" />
            )}
            {property.isDisputed
              ? "⚠ Property under litigation / dispute"
              : " Clear title – no litigation detected"}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
                <SurveyMap
                  surveyNumber={property.surveyNumber}
                  height="520px"
                  onSurveyLocate={(lat, lng) => {
                    setSurveyLat(lat);
                    setSurveyLng(lng);
                  }}
                />
              </div>

              <NearbyLandmarks landmarks={property.nearbyLandmarks} />
              <TitleDeedHistory
                history={property.ownershipHistory}
                isDisputed={property.isDisputed}
              />
            </div>

            <div className="lg:col-span-1">
              <PropertyReport property={property} />
            </div>
          </div>
        </main>
      ) : (
        <main className="flex-1 flex items-center justify-center text-white/50">
          Property not found
        </main>
      )}

      <Footer />
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center text-white/60">
          Loading property intelligence…
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
