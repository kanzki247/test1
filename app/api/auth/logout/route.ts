import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()

    // 세션 쿠키 삭제
    cookieStore.delete("user-session")

    return NextResponse.json({ success: true, message: "로그아웃되었습니다." })
  } catch (error) {
    console.error("로그아웃 오류:", error)
    return NextResponse.json({ success: false, message: "로그아웃 중 오류가 발생했습니다." }, { status: 500 })
  }
}
