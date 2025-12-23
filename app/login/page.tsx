"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, Key, User, Loader2, Chrome } from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  // Login state
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAadhar, setRegAadhar] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setLoginError("Enter a valid 10-digit phone number");
      return;
    }
    setLoginLoading(true);
    setLoginError("");

    await new Promise((r) => setTimeout(r, 1200));
    setOtp("5678"); // demo OTP
    setOtpSent(true);
    setLoginLoading(false);
  };

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");

    const success = await login(phone, otp);
    if (success) router.push("/search");
    else setLoginError("Invalid OTP");

    setLoginLoading(false);
  };

  const handleRegister = async () => {
    if (!regName || !regPhone || !regAadhar) return;
    setRegLoading(true);

    await register(regName, regAadhar, "USER", regPhone);
    router.push("/search");
  };

  const handleGoogleLogin = () => {
    alert("Google login clicked (demo placeholder)");
  };

  return (
<div className="min-h-screen flex items-center justify-center bg-[#0B0F1A] px-4 relative overflow-hidden">
  {/* Glowing Conic Gradient Background */}
  <div
    className="absolute -top-20 -left-20 w-[120%] h-[500px] 
               rounded-tl-full rounded-br-full
               animate-[spin_40s_linear_infinite]
               bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#6366F1_50%,#A855F7_100%)]
               opacity-40 blur-3xl"
  />
  
  {/* Your login card goes here */}
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    className="relative w-full max-w-md rounded-3xl border border-white/10
               bg-white/5 backdrop-blur-xl p-8 shadow-2xl z-10"
  >
     {/* Login Card */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-white">
            Bhoomi-GIS Access
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Secure land intelligence platform
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid grid-cols-2 bg-white/5 rounded-xl p-1">
            <TabsTrigger
              value="login"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-black"
            >
              Register
            </TabsTrigger>
          </TabsList>

          {/* LOGIN */}
          <TabsContent value="login" className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </Label>
              <Input
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                disabled={otpSent}
                placeholder="10-digit mobile"
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <AnimatePresence>
              {otpSent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <Label className="text-white/70 flex items-center gap-2">
                    <Key className="w-4 h-4" /> OTP
                  </Label>
                  <Input
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="bg-white/5 border-white/10 text-white"
                  />
                  <p className="text-xs text-gray-400">
                    OTP auto-filled for demo
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {loginError && <p className="text-sm text-red-400">{loginError}</p>}

            {!otpSent ? (
              <Button
                onClick={handleSendOTP}
                disabled={loginLoading}
                className="w-full bg-white hover:bg-white/30 text-black hover:text-white"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending OTP
                  </>
                ) : (
                  "Get OTP"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full bg-white text-black hover:text-white hover:bg-white/10"
              >
                {loginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            )}

            {/* Demo login info */}
            <div className="pt-4 border-t border-white/20">
              <p className="text-xs text-white/60 text-center">
                Demo: Phone{" "}
                <span className="font-mono text-white">9876543210</span>, OTP{" "}
                <span className="font-mono text-white">5678</span>
              </p>
            </div>

            {/* Google login button */}
            <Button
              onClick={handleGoogleLogin}
              variant="outline"
              className="w-full mt-4 flex items-center justify-center gap-2 border-white/30 text-black hover:bg-white/10"
            >
              <Chrome className="w-4 h-4" />
              Login with Google
            </Button>
          </TabsContent>

          {/* REGISTER */}
          <TabsContent value="register" className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2">
                <User className="w-4 h-4" /> Full Name
              </Label>
              <Input
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70 flex items-center gap-2">
                <Phone className="w-4 h-4" /> Phone Number
              </Label>
              <Input
                value={regPhone}
                onChange={(e) =>
                  setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/70">Aadhar Number</Label>
              <Input
                value={regAadhar}
                onChange={(e) => setRegAadhar(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <Button
              onClick={handleRegister}
              disabled={regLoading}
              className="w-full bg-white hover:bg-gray-600 text-black hover:text-white"
            >
              {regLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
