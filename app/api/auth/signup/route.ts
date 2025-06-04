import { type NextRequest, NextResponse } from "next/server"
import oracledb from "oracledb"

interface SignUpRequest {
  name: string
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const data: SignUpRequest = await request.json()
    const { name, email, password } = data

    const conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
    })

    // 이메일 중복 확인
    const checkResult = await conn.execute(
      `SELECT COUNT(*) AS COUNT FROM "USER"."USERS" WHERE EMAIL = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )
    
    if (checkResult.rows && checkResult.rows[0].COUNT > 0) {
      await conn.close()
      return NextResponse.json({ success: false, message: '이미 사용 중인 이메일입니다.' }, { status: 400 })
    }

    // 사용자 ID 생성 (예: USER_이메일의 첫 부분_랜덤숫자)
    const userId = `USER_${email.split('@')[0]}_${Math.floor(Math.random() * 10000)}`

    // 사용자 등록
    await conn.execute(
      `INSERT INTO "USER"."USERS" (USER_ID, PASSWORD, NAME, EMAIL, ROLE) 
       VALUES (:userId, :password, :name, :email, 'staff')`,
      { userId, password, name, email }
    )
    
    await conn.commit()
    await conn.close()
    
    return NextResponse.json({ success: true })
    

    console.log("회원가입 시도:", { name, email, password })

    // 이메일 중복 확인 (실제로는 DB에서 확인)
    const mockUsers = [
      {
        USER_ID: "admin",
        NAME: "관리자",
        EMAIL: "admin@company.com",
        PASSWORD: "admin123",
      },
      {
        USER_ID: "user1",
        NAME: "김철수",
        EMAIL: "kim@company.com",
        PASSWORD: "user123",
      },
    ]

    const existingUser = mockUsers.find((u) => u.EMAIL === email)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "이미 사용 중인 이메일입니다." }, { status: 400 })
    }

    // 실제로는 DB에 저장
    const userId = `USER_${email.split("@")[0]}_${Math.floor(Math.random() * 10000)}`
    console.log("새 사용자 생성:", { userId, name, email, password, role: "staff" })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("회원가입 오류:", error)
    return NextResponse.json({ success: false, message: "서버 오류가 발생했습니다." }, { status: 500 })
  }
}
