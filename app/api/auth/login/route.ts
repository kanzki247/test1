import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // 관리자 계정인 경우 자동 생성 시도
    if (email === "admin@company.com" && password === "admin123") {
      // 먼저 관리자 계정이 존재하는지 확인
      const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)

      if (!existingUser.user) {
        console.log("관리자 계정이 없어서 자동 생성합니다...")
        // 관리자 계정 자동 생성
        const createResponse = await fetch(`${request.nextUrl.origin}/api/auth/create-admin`, {
          method: "POST",
        })

        if (!createResponse.ok) {
          console.error("관리자 계정 자동 생성 실패")
        } else {
          console.log("관리자 계정 자동 생성 완료")
        }
      }
    }

    // Supabase Auth를 사용한 로그인
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error("Supabase 로그인 오류:", authError)

      // 관리자 계정인 경우 한 번 더 생성 시도
      if (email === "admin@company.com" && password === "admin123") {
        console.log("관리자 계정 로그인 실패, 재생성 시도...")
        const createResponse = await fetch(`${request.nextUrl.origin}/api/auth/create-admin`, {
          method: "POST",
        })

        if (createResponse.ok) {
          // 재생성 후 다시 로그인 시도
          const { data: retryAuthData, error: retryAuthError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (!retryAuthError && retryAuthData.user) {
            return await handleSuccessfulLogin(retryAuthData.user, email)
          }
        }
      }

      return NextResponse.json({ success: false, message: "이메일 또는 비밀번호가 잘못되었습니다." }, { status: 401 })
    }

    if (authData.user) {
      return await handleSuccessfulLogin(authData.user, email)
    }

    return NextResponse.json({ success: false, message: "로그인에 실패했습니다." }, { status: 401 })
  } catch (error) {
    console.error("로그인 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}

async function handleSuccessfulLogin(user: any, email: string) {
  // 사용자 정보 조회
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("user_id, name, email, role")
    .eq("email", email)
    .single()

  let userSession

  if (userError || !userData) {
    console.log("사용자 정보가 없어서 기본 정보로 생성합니다...")
    // 사용자 정보가 없는 경우 기본 정보로 생성
    const defaultUserData = {
      user_id: user.id,
      name: email === "admin@company.com" ? "관리자" : email.split("@")[0],
      email: email,
      role: email === "admin@company.com" ? "admin" : "staff",
    }

    // users 테이블에 기본 사용자 정보 저장
    const { error: insertError } = await supabase.from("users").upsert(defaultUserData)

    if (insertError) {
      console.error("기본 사용자 정보 생성 오류:", insertError)
    }

    userSession = {
      USER_ID: defaultUserData.user_id,
      NAME: defaultUserData.name,
      EMAIL: defaultUserData.email,
      ROLE: defaultUserData.role,
    }
  } else {
    userSession = {
      USER_ID: userData.user_id,
      NAME: userData.name,
      EMAIL: userData.email,
      ROLE: userData.role,
    }
  }

  // 세션 쿠키 설정
  const cookieStore = await cookies()
  cookieStore.set("user-session", JSON.stringify(userSession), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7일
  })

  return NextResponse.json({ success: true, user: userSession })
}
