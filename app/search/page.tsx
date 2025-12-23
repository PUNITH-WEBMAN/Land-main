"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { karnatakaData } from "@/lib/mock-data";
import { Search, MapPin, Loader2 } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, addToSearchHistory } = useAuth();

  const [district, setDistrict] = useState("");
  const [taluk, setTaluk] = useState("");
  const [hobli, setHobli] = useState("");
  const [village, setVillage] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (isReady && !isAuthenticated) router.push("/login");
  }, [isReady, isAuthenticated, router]);

  const availableTaluks = district
    ? karnatakaData.taluks[district as keyof typeof karnatakaData.taluks] || []
    : [];

  const availableHoblis = taluk
    ? karnatakaData.hoblis[taluk as keyof typeof karnatakaData.hoblis] || []
    : [];

  const availableVillages = hobli
    ? karnatakaData.villages[hobli as keyof typeof karnatakaData.villages] || []
    : [];

  useEffect(() => {
    setTaluk("");
    setHobli("");
    setVillage("");
  }, [district]);

  useEffect(() => {
    setHobli("");
    setVillage("");
  }, [taluk]);

  useEffect(() => {
    setVillage("");
  }, [hobli]);

  const applyQuickSelection = (
    districtId: string,
    talukId: string,
    hobliId: string,
    villageId: string,
    survey: string
  ) => {
    setDistrict(districtId);
    setTimeout(() => {
      setTaluk(talukId);
      setTimeout(() => {
        setHobli(hobliId);
        setTimeout(() => {
          setVillage(villageId);
          setSurveyNumber(survey);
        }, 0);
      }, 0);
    }, 0);
  };

  // ---------- Robust search handler (fixed) ----------
  const handleSearch = async () => {
    if (!surveyNumber) return;

    setSearching(true);

    try {
      // If addToSearchHistory exists and is a function, await it (works for sync or async)
      if (typeof addToSearchHistory === "function") {
        await Promise.resolve(addToSearchHistory(surveyNumber));
      }

      // small UX delay before navigation (keeps spinner visible)
      await new Promise((r) => setTimeout(r, 500));

      // navigate to results
      router.push(`/results?survey=${encodeURIComponent(surveyNumber)}`);
    } catch (err) {
      // log and reset UI so user can retry
      // eslint-disable-next-line no-console
      console.error("Search error:", err);
      setSearching(false);
    }
  };

  if (!isReady || !isAuthenticated) return null;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0B0F1A] overflow-hidden">
      {/* Ambient Orbs */}
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-indigo-500/20 blur-[120px]" />
      <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-cyan-400/20 blur-[120px]" />
      <div className="absolute bottom-20 left-1/4 w-[420px] h-[420px] rounded-full bg-purple-500/20 blur-[120px]" />

      <Header />

      <main className="relative z-10 flex-1 max-w-2xl mx-auto px-4 py-16">
        {/* Heading */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-2">
            Search Land Records
          </h1>
          <p className="text-white/60">
            Verify ownership, disputes, and land intelligence instantly
          </p>
        </div>

        {/* Card */}
        <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Location Selection
            </CardTitle>
            <CardDescription className="text-white/50">
              Select administrative boundaries step by step
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-7">
            {[
              {
                label: "District",
                value: district,
                set: setDistrict,
                items: karnatakaData.districts,
                placeholder: "Select District",
              },
              {
                label: "Taluk",
                value: taluk,
                set: setTaluk,
                items: availableTaluks,
                disabled: !district,
                placeholder: district ? "Select Taluk" : "Select District first",
              },
              {
                label: "Hobli",
                value: hobli,
                set: setHobli,
                items: availableHoblis,
                disabled: !taluk,
                placeholder: taluk ? "Select Hobli" : "Select Taluk first",
              },
              {
                label: "Village",
                value: village,
                set: setVillage,
                items: availableVillages,
                disabled: !hobli,
                placeholder: hobli ? "Select Village" : "Select Hobli first",
              },
            ].map((field) => (
              <div key={field.label} className="space-y-2">
                <Label className="text-white/70">{field.label}</Label>

                <Select
                  value={field.value}
                  onValueChange={field.set}
                  disabled={field.disabled}
                >
                  <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white focus:ring-2 focus:ring-indigo-500/40">
                    <SelectValue
                      placeholder={field.placeholder}
                      className="text-white"
                    />
                  </SelectTrigger>

                  <SelectContent className="bg-[#0B0F1A] border-white/10 text-white">
                    {field.items.map((i: any) => (
                      <SelectItem
                        key={i.id}
                        value={i.id}
                        className="text-white focus:bg-white/10"
                      >
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}

            {/* Survey */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <Label className="text-white/70">Survey Number</Label>
              <Input
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                placeholder="Enter survey number"
                className="h-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={searching || !surveyNumber}
              className="w-full h-14 border border-white/30 text-black bg-white hover:bg-white/10 hover:text-white transition"
            >
              {searching ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching…
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Search Property
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Search */}
        <div className="mt-14">
          <h3 className="text-sm text-white/50 mb-5">Quick Search</h3>
          <div className="flex flex-wrap gap-4">
            {["44", "38", "21", "78", "45", "99"].map((survey) => (
              <Button
                key={survey}
                size="lg"
                variant="outline"
                onClick={() =>
                  applyQuickSelection(
                    "bengaluru-urban",
                    "bangalore-south",
                    "uttarahalli",
                    "alahalli",
                    survey
                  )
                }
                className="px-8 rounded-full border-white/30 text-black bg-white hover:bg-white/10 hover:text-white transition"
              >
                {survey}
              </Button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
