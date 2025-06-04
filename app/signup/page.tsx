"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import AnimatedBackground from "@/components/animated-background"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        // 3초 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError(data.message || "회원가입에 실패했습니다.")
      }
    } catch (error) {
      console.error("회원가입 오류:", error)
      setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <AnimatedBackground />
      <Card className="w-full max-w-sm relative z-10">
        <CardHeader>
          <CardTitle>Create an account</CardTitle>
          <CardDescription>Enter your information to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center py-4">
              <div className="text-green-500 font-medium mb-2">회원가입이 완료되었습니다!</div>
              <div className="text-sm text-muted-foreground">잠시 후 로그인 페이지로 이동합니다...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="홍길동"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="text-sm text-red-500 text-center">{error}</div>}
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {!success && (
            <>
              <Button type="submit" className="w-full" onClick={handleSubmit} disabled={loading}>
                {loading ? "처리 중..." : "Sign up"}
              </Button>
              <Button variant="outline" className="w-full">
                Sign up with Google
              </Button>
            </>
          )}
          <div className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
