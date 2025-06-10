"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  USER_ID: string
  NAME: string
  EMAIL: string
  ROLE?: string
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

      // 401은 정상적인 "로그인되지 않음" 상태이므로 에러로 처리하지 않음
      if (response.status === 401) {
        setUser(null)
        setLoading(false)
        return
      }

      // 다른 에러 상태 코드 확인
      if (!response.ok) {
        console.error(`세션 확인 실패: ${response.status} ${response.statusText}`)
        setUser(null)
        setLoading(false)
        return
      }

      // 응답이 JSON인지 확인
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("세션 API가 JSON이 아닌 응답을 반환했습니다:", contentType)
        setUser(null)
        setLoading(false)
        return
      }

      const data = await response.json()

      if (data.success && data.user) {
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("세션 확인 오류:", error)
      setUser(null)
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
        // 로그아웃 실패해도 클라이언트 상태는 초기화
        setUser(null)
      }
    } catch (error) {
      console.error("로그아웃 오류:", error)
      // 에러가 발생해도 클라이언트 상태는 초기화
      setUser(null)
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
