import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    // 관리자 계정 생성
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: "admin@company.com",
      password: "admin123",
      email_confirm: true,
    })

    if (adminAuthError) {
      console.error("관리자 계정 생성 오류:", adminAuthError)
      return NextResponse.json({ success: false, message: adminAuthError.message }, { status: 400 })
    }

    // users 테이블에 관리자 정보 저장
    const { error: adminInsertError } = await supabase.from("users").upsert({
      user_id: "admin",
      name: "관리자",
      email: "admin@company.com",
      role: "admin",
    })

    if (adminInsertError) {
      console.error("관리자 정보 저장 오류:", adminInsertError)
    }

    // 테스트 사용자 계정 생성
    const { data: userAuthData, error: userAuthError } = await supabase.auth.admin.createUser({
      email: "kim@company.com",
      password: "user123",
      email_confirm: true,
    })

    if (userAuthError) {
      console.error("테스트 사용자 계정 생성 오류:", userAuthError)
    } else {
      // users 테이블에 테스트 사용자 정보 저장
      const { error: userInsertError } = await supabase.from("users").upsert({
        user_id: "user1",
        name: "김철수",
        email: "kim@company.com",
        role: "staff",
      })

      if (userInsertError) {
        console.error("테스트 사용자 정보 저장 오류:", userInsertError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "관리자 계정이 성공적으로 생성되었습니다.",
      adminCreated: !!adminAuthData.user,
      testUserCreated: !!userAuthData?.user,
    })
  } catch (error) {
    console.error("계정 생성 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
