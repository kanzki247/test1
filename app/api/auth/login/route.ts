import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Supabase Auth를 사용한 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Supabase 로그인 오류:", authError)
      return NextResponse.json({ success: false, message: "이메일 또는 비밀번호가 잘못되었습니다." }, { status: 401 })
    }

    if (authData.user) {
      // 사용자 정보 조회
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("user_id, name, email")
        .eq("email", email)
        .single()

      if (userError) {
        console.error("사용자 정보 조회 오류:", userError)
        return NextResponse.json({ success: false, message: "사용자 정보를 찾을 수 없습니다." }, { status: 404 })
      }

      // 세션 쿠키 설정
      const cookieStore = await cookies()
      const userSession = {
        USER_ID: userData.user_id,
        NAME: userData.name,
        EMAIL: userData.email,
      }

      cookieStore.set("user-session", JSON.stringify(userSession), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7일
      })

      return NextResponse.json({ success: true, user: userSession })
    }

    return NextResponse.json({ success: false, message: "로그인에 실패했습니다." }, { status: 401 })
  } catch (error) {
    console.error("로그인 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
