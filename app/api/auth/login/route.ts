import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Supabase Auth로 로그인 시도
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Supabase 로그인 오류:", authError.message)

      // 관리자 계정인 경우 자동 생성 시도
      if (email === "admin@company.com" && password === "admin123") {
        try {
          // 관리자 계정 생성
          const { data: createData, error: createError } = await supabase.auth.admin.createUser({
            email: "admin@company.com",
            password: "admin123",
            email_confirm: true,
            user_metadata: {
              name: "Administrator",
              role: "admin",
            },
          })

          if (createError) {
            console.error("관리자 계정 생성 오류:", createError)
            return NextResponse.json({ success: false, message: "관리자 계정 생성에 실패했습니다." }, { status: 400 })
          }

          // 생성 후 다시 로그인 시도
          const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (retryAuthError) {
            console.error("재시도 로그인 오류:", retryAuthError)
            return NextResponse.json({ success: false, message: "로그인에 실패했습니다." }, { status: 400 })
          }

          return await handleSuccessfulLogin(retryAuthData.user, email)
        } catch (createErr) {
          console.error("계정 생성 중 오류:", createErr)
          return NextResponse.json({ success: false, message: "계정 생성 중 오류가 발생했습니다." }, { status: 500 })
        }
      }

      return NextResponse.json(
        { success: false, message: "이메일 또는 비밀번호가 올바르지 않습니다." },
        { status: 400 },
      )
    }

    return await handleSuccessfulLogin(authData.user, email)
  } catch (error) {
    console.error("로그인 처리 오류:", error)
    return NextResponse.json({ success: false, message: "로그인 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}

async function handleSuccessfulLogin(user: any, email: string) {
  try {
    // users 테이블에서 사용자 정보 조회
    const { data: userData, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

    let finalUserData = userData

    // 사용자 정보가 없으면 생성
    if (userError || !userData) {
      const newUser = {
        user_id: user.id,
        name: user.user_metadata?.name || email.split("@")[0],
        email: email,
        role: email === "admin@company.com" ? "admin" : "staff",
        created_at: new Date().toISOString(),
      }

      const { data: insertedUser, error: insertError } = await supabase.from("users").insert(newUser).select().single()

      if (insertError) {
        console.error("사용자 정보 생성 오류:", insertError)
        // 사용자 정보 생성에 실패해도 로그인은 허용
        finalUserData = {
          user_id: user.id,
          name: user.user_metadata?.name || email.split("@")[0],
          email: email,
          role: email === "admin@company.com" ? "admin" : "staff",
        }
      } else {
        finalUserData = insertedUser
      }
    }

    // 세션 쿠키 설정
    const sessionData = {
      USER_ID: finalUserData.user_id,
      NAME: finalUserData.name,
      EMAIL: finalUserData.email,
      ROLE: finalUserData.role,
    }

    const cookieStore = cookies()
    cookieStore.set("user-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    })

    return NextResponse.json({
      success: true,
      user: sessionData,
      message: "로그인 성공",
    })
  } catch (error) {
    console.error("사용자 정보 처리 오류:", error)
    return NextResponse.json({ success: false, message: "사용자 정보 처리 중 오류가 발생했습니다." }, { status: 500 })
  }
}
