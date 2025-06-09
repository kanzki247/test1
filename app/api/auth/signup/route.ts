import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

interface SignUpRequest {
  name: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const data: SignUpRequest = await request.json()
    const { name, email, password } = data

    // Supabase Auth를 사용한 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      console.error("Supabase 회원가입 오류:", authError)
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 })
    }

    if (authData.user) {
      // 사용자 ID 생성
      const userId = `USER_${email.split("@")[0]}_${Math.floor(Math.random() * 10000)}`

      // users 테이블에 사용자 정보 저장
      const { error: insertError } = await supabase.from("users").insert({
        user_id: userId,
        name,
        email,
        role: "staff",
      })

      if (insertError) {
        console.error("사용자 정보 저장 오류:", insertError)
        return NextResponse.json({ success: false, message: "사용자 정보 저장에 실패했습니다." }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, message: "회원가입에 실패했습니다." }, { status: 400 })
  } catch (error) {
    console.error("회원가입 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
