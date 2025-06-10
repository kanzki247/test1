"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import AnimatedBackground from "@/components/animated-background"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [email, setEmail] = useState("admin@company.com")
  const [password, setPassword] = useState("admin123")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false)
  const [adminCreated, setAdminCreated] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await login(email, password)

      if (result.success) {
        router.push("/dashboard")
      } else {
        setError(result.message || "로그인에 실패했습니다.")
      }
    } catch (error) {
      console.error("로그인 처리 중 오류:", error)
      setError("로그인 처리 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAdmin = async () => {
    setIsCreatingAdmin(true)
    setError("")
    setAdminCreated(false)

    try {
      const response = await fetch("/api/auth/create-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setAdminCreated(true)
        setError("")
      } else {
        console.error("관리자 계정 생성 실패:", data)
        setError(data.message || "관리자 계정 생성에 실패했습니다.")
      }
    } catch (error) {
      console.error("관리자 계정 생성 오류:", error)
      setError("관리자 계정 생성 중 오류가 발생했습니다.")
    } finally {
      setIsCreatingAdmin(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <Card className="w-full max-w-sm relative z-10">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {adminCreated && (
            <Alert className="mb-4 bg-green-50 border-green-200">
              <AlertDescription className="text-green-700">
                관리자 계정이 성공적으로 생성되었습니다. 이제 로그인할 수 있습니다.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="admin123"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full" onClick={handleSubmit} disabled={loading}>
            {loading ? "로그인 중..." : "Login"}
          </Button>
          <Button variant="outline" className="w-full" onClick={handleCreateAdmin} disabled={isCreatingAdmin}>
            {isCreatingAdmin ? "계정 생성 중..." : "Create Admin Account"}
          </Button>
          <div className="text-xs text-muted-foreground text-center mt-2">
            <strong>Demo:</strong> admin@company.com / admin123
          </div>
          <div className="text-xs text-muted-foreground text-center">
            먼저 "Create Admin Account" 버튼을 클릭하여 계정을 생성하세요.
          </div>
          <div className="text-sm text-center mt-4">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
