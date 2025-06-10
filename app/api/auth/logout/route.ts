import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = cookies()

    // 세션 쿠키 삭제
    cookieStore.set("user-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0, // 즉시 만료
      path: "/",
    })

    return NextResponse.json({ success: true, message: "로그아웃 성공" })
  } catch (error) {
    console.error("로그아웃 오류:", error)
    return NextResponse.json({ success: false, message: "로그아웃 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
