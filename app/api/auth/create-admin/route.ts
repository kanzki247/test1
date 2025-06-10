import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// 필요한 테이블 생성 함수
async function ensureTablesExist() {
  // users 테이블 생성
  const { error: usersTableError } = await supabase.rpc("create_users_table_if_not_exists")

  if (usersTableError) {
    console.log("RPC 함수 호출 실패, SQL로 직접 테이블 생성 시도")
    const { error } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `)

    if (error) {
      console.error("users 테이블 생성 오류:", error)
      throw error
    }
  }
}

export async function POST() {
  try {
    // 테이블 존재 확인 및 생성
    await ensureTablesExist()

    // 기존 사용자 확인
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", "admin@company.com").single()

    let userId

    // Supabase Auth에 관리자 계정 생성
    if (!existingUser) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: "admin@company.com",
        password: "admin123",
        email_confirm: true, // 이메일 확인 없이 바로 활성화
      })

      if (authError) {
        // 이미 존재하는 사용자인 경우 로그인 시도
        if (authError.message.includes("already been registered")) {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: "admin@company.com",
            password: "admin123",
          })

          if (signInError) {
            console.error("기존 계정 로그인 오류:", signInError)
            return NextResponse.json({ success: false, message: signInError.message }, { status: 400 })
          }

          userId = signInData.user.id
        } else {
          console.error("관리자 계정 생성 오류:", authError)
          return NextResponse.json({ success: false, message: authError.message }, { status: 400 })
        }
      } else {
        userId = authData.user.id
      }

      // users 테이블에 사용자 정보 저장
      const { error: insertError } = await supabase.from("users").upsert({
        user_id: userId,
        name: "관리자",
        email: "admin@company.com",
        role: "admin",
      })

      if (insertError) {
        console.error("사용자 정보 저장 오류:", JSON.stringify(insertError, null, 2))
        return NextResponse.json(
          {
            success: false,
            message: `사용자 정보 저장 오류: ${insertError.message || JSON.stringify(insertError)}`,
            details: insertError,
          },
          { status: 400 },
        )
      }
    } else {
      userId = existingUser.user_id
    }

    return NextResponse.json({
      success: true,
      message: "관리자 계정이 성공적으로 생성되었습니다.",
      user: {
        id: userId,
        email: "admin@company.com",
      },
    })
  } catch (error: any) {
    console.error("관리자 계정 생성 중 오류:", error)
    return NextResponse.json(
      {
        success: false,
        message: `서버 오류가 발생했습니다: ${error.message || JSON.stringify(error)}`,
        details: error,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST() // GET 요청도 POST와 동일하게 처리
}
