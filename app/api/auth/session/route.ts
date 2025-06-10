import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("user-session")

    if (sessionCookie) {
      try {
        const user = JSON.parse(sessionCookie.value)
        return NextResponse.json({ success: true, user })
      } catch (parseError) {
        console.error("세션 쿠키 파싱 오류:", parseError)
        // 쿠키가 손상된 경우 응답만 반환 (쿠키 삭제는 클라이언트에서 처리)
        return NextResponse.json({ success: false, message: "세션 쿠키가 손상되었습니다." }, { status: 401 })
      }
    } else {
      return NextResponse.json({ success: false, message: "세션이 없습니다." }, { status: 401 })
    }
  } catch (error) {
    console.error("세션 확인 오류:", error)
    return NextResponse.json({ success: false, message: "세션 확인 중 오류가 발생했습니다." }, { status: 500 })
  }
}
