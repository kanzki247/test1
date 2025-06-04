import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import oracledb from "oracledb"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
    })

    const result = await conn.execute(
      `SELECT USER_ID, NAME, EMAIL FROM USERS 
       WHERE EMAIL = :email AND PASSWORD = :password`,
      { email, password },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )
    
    await conn.close()
    
    if (result.rows && result.rows.length > 0) {
      const user = result.rows[0]
      // 세션 쿠키 설정
      const cookieStore = await cookies()
      cookieStore.set('user-session', JSON.stringify(user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7일
      })
      
      return NextResponse.json({ success: true, user })
    } else {
      return NextResponse.json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' }, { status: 401 })
    }
    
  } catch (error) {
    console.error("로그인 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
