import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST() {
  try {
    // 먼저 users 테이블이 존재하는지 확인
    const { data: tableCheck, error: tableError } = await supabase
      .from("users")
      .select("count", { count: "exact" })
      .limit(1)

    if (tableError) {
      console.error("users 테이블 확인 오류:", tableError)
      return NextResponse.json(
        {
          success: false,
          message: "users 테이블이 존재하지 않습니다. 먼저 데이터베이스 스크립트를 실행해주세요.",
          details: tableError,
        },
        { status: 400 },
      )
    }

    // 기존 사용자 확인
    const { data: existingUser } = await supabase.from("users").select("*").eq("email", "admin@company.com").single()

    let userId
    let authUser

    if (!existingUser) {
      // Supabase Auth에 관리자 계정 생성
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: "admin@company.com",
        password: "admin123",
        email_confirm: true,
      })

      if (authError) {
        // 이미 존재하는 사용자인 경우 사용자 정보 가져오기
        if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
          const { data: userData, error: userError } = await supabase.auth.admin.listUsers()
          if (!userError && userData.users) {
            authUser = userData.users.find((user) => user.email === "admin@company.com")
            if (authUser) {
              userId = authUser.id
            }
          }

          if (!userId) {
            return NextResponse.json(
              {
                success: false,
                message: "계정이 이미 존재하지만 사용자 정보를 가져올 수 없습니다.",
              },
              { status: 400 },
            )
          }
        } else {
          console.error("관리자 계정 생성 오류:", authError)
          return NextResponse.json({ success: false, message: authError.message }, { status: 400 })
        }
      } else {
        userId = authData.user.id
        authUser = authData.user
      }

      // users 테이블에 사용자 정보 저장
      const { error: insertError } = await supabase.from("users").upsert(
        {
          user_id: userId,
          name: "관리자",
          email: "admin@company.com",
          role: "admin",
        },
        {
          onConflict: "email",
        },
      )

      if (insertError) {
        console.error("사용자 정보 저장 오류:", JSON.stringify(insertError, null, 2))
        return NextResponse.json(
          {
            success: false,
            message: `사용자 정보 저장 오류: ${insertError.message}`,
            details: insertError,
          },
          { status: 400 },
        )
      }
    } else {
      userId = existingUser.user_id
    }

    // 테스트 사용자도 생성 (선택사항)
    try {
      const { data: testAuthData, error: testAuthError } = await supabase.auth.admin.createUser({
        email: "kim@company.com",
        password: "user123",
        email_confirm: true,
      })

      if (!testAuthError && testAuthData.user) {
        await supabase.from("users").upsert(
          {
            user_id: testAuthData.user.id,
            name: "김철수",
            email: "kim@company.com",
            role: "staff",
          },
          {
            onConflict: "email",
          },
        )
      }
    } catch (testError) {
      console.log("테스트 사용자 생성 실패 (무시됨):", testError)
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
        message: `서버 오류가 발생했습니다: ${error.message}`,
        details: error,
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  return POST()
}
