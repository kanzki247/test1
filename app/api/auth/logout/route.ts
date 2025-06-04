import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("user-session")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("로그아웃 오류:", error)
    return NextResponse.json({ success: false, message: "로그아웃 중 오류가 발생했습니다." }, { status: 500 })
  }
}
