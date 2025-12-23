"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type UserData, mockUser } from "./mock-data"

interface AuthContextType {
  user: UserData | null
  isAuthenticated: boolean
  isReady: boolean
  login: (phone: string, otp: string) => Promise<boolean>
  register: (name: string, aadhar: string, role: "buyer" | "seller" | "agent", phone: string) => Promise<boolean>
  logout: () => void
  addToWatchlist: (surveyNumber: string) => void
  removeFromWatchlist: (surveyNumber: string) => void
  addToSearchHistory: (surveyNumber: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Check for existing session with expiry
    try {
      const raw = localStorage.getItem("bhoomi-session")
      if (raw) {
        const parsed = JSON.parse(raw) as { user: UserData; expiresAt: number }
        if (parsed && parsed.user && parsed.expiresAt && Date.now() < parsed.expiresAt) {
          setUser(parsed.user)
        } else {
          // expired session
          localStorage.removeItem("bhoomi-session")
          localStorage.removeItem("bhoomi-user")
        }
      } else {
        // backward compatibility: migrate existing user without expiry to a 3h session
        const savedUser = localStorage.getItem("bhoomi-user")
        if (savedUser) {
          const u = JSON.parse(savedUser) as UserData
          const expiresAt = Date.now() + 3 * 60 * 60 * 1000
          localStorage.setItem("bhoomi-session", JSON.stringify({ user: u, expiresAt }))
          setUser(u)
        }
      }
    } catch {}
    setIsReady(true)
  }, [])

  const login = async (phone: string, otp: string): Promise<boolean> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (phone === "9876543210" && otp === "5678") {
      const userData = { ...mockUser, phone }
      setUser(userData)
      const expiresAt = Date.now() + 3 * 60 * 60 * 1000 // 3 hours
      localStorage.setItem("bhoomi-session", JSON.stringify({ user: userData, expiresAt }))
      localStorage.setItem("bhoomi-user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const register = async (
    name: string,
    aadhar: string,
    role: "buyer" | "seller" | "agent",
    phone: string,
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userData: UserData = {
      phone,
      name,
      aadhar: `XXXX-XXXX-${aadhar.slice(-4)}`,
      role,
      watchlist: [],
      searchHistory: [],
    }
    setUser(userData)
    const expiresAt = Date.now() + 3 * 60 * 60 * 1000
    localStorage.setItem("bhoomi-session", JSON.stringify({ user: userData, expiresAt }))
    localStorage.setItem("bhoomi-user", JSON.stringify(userData))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("bhoomi-user")
    localStorage.removeItem("bhoomi-session")
  }

  const addToWatchlist = (surveyNumber: string) => {
    if (user && !user.watchlist.includes(surveyNumber)) {
      const updated = { ...user, watchlist: [...user.watchlist, surveyNumber] }
      setUser(updated)
      localStorage.setItem("bhoomi-user", JSON.stringify(updated))
    }
  }

  const removeFromWatchlist = (surveyNumber: string) => {
    if (user) {
      const updated = { ...user, watchlist: user.watchlist.filter((s) => s !== surveyNumber) }
      setUser(updated)
      localStorage.setItem("bhoomi-user", JSON.stringify(updated))
      const sessRaw = localStorage.getItem("bhoomi-session")
      if (sessRaw) {
        try {
          const sess = JSON.parse(sessRaw)
          localStorage.setItem("bhoomi-session", JSON.stringify({ ...sess, user: updated }))
        } catch {}
      }
    }
  }

  const addToSearchHistory = (surveyNumber: string) => {
    if (user) {
      const updated = { ...user, searchHistory: [surveyNumber, ...user.searchHistory].slice(0, 20) }
      setUser(updated)
      localStorage.setItem("bhoomi-user", JSON.stringify(updated))
      const sessRaw = localStorage.getItem("bhoomi-session")
      if (sessRaw) {
        try {
          const sess = JSON.parse(sessRaw)
          localStorage.setItem("bhoomi-session", JSON.stringify({ ...sess, user: updated }))
        } catch {}
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isReady,
        login,
        register,
        logout,
        addToWatchlist,
        removeFromWatchlist,
        addToSearchHistory,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
