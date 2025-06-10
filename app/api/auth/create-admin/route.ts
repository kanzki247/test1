import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // Supabase Auth에 관리자 계정 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: "admin@company.com",
      password: "admin123",
      email_confirm: true, // 이메일 확인 없이 바로 활성화
    })

    if (authError) {
      console.error("관리자 계정 생성 오류:", authError)
      return NextResponse.json({ success: false, message: authError.message }, { status: 400 })
    }

    // users 테이블에 사용자 정보 저장
    const { error: insertError } = await supabase.from("users").upsert({
      user_id: authData.user.id,
      name: "관리자",
      email: "admin@company.com",
      role: "admin",
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      console.error("사용자 정보 저장 오류:", insertError)
      return NextResponse.json({ success: false, message: insertError.message }, { status: 400 })
    }

    // 테스트 사용자도 생성
    const { data: testAuthData, error: testAuthError } = await supabase.auth.admin.createUser({
      email: "kim@company.com",
      password: "user123",
      email_confirm: true,
    })

    if (!testAuthError && testAuthData.user) {
      await supabase.from("users").upsert({
        user_id: testAuthData.user.id,
        name: "김철수",
        email: "kim@company.com",
        role: "staff",
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: "관리자 계정이 성공적으로 생성되었습니다.",
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
    })
  } catch (error) {
    console.error("관리자 계정 생성 중 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

export async function GET() {
  return POST() // GET 요청도 POST와 동일하게 처리
}
