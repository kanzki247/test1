"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  USER_ID: string
  NAME: string
  EMAIL: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch("/api/auth/session")

      // 응답 상태 코드 확인
      if (!response.ok) {
        console.error(`세션 확인 실패: ${response.status} ${response.statusText}`)
        setLoading(false)
        return
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("세션 API가 JSON이 아닌 응답을 반환했습니다:", contentType)
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("세션 확인 오류:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setUser(data.user)
        return { success: true }
      } else {
        console.log("로그인 실패:", data.message)
        return { success: false, message: data.message || "로그인에 실패했습니다." }
      }
    } catch (error) {
      console.error("로그인 오류:", error)
      return { success: false, message: "로그인 중 오류가 발생했습니다." }
    }
  }

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" })
      if (response.ok) {
        setUser(null)
      } else {
        console.error("로그아웃 실패:", response.statusText)
      }
    } catch (error) {
      console.error("로그아웃 오류:", error)
    }
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
