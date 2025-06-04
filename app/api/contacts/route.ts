import { NextResponse } from "next/server" // Next.js의 응답 객체 불러오기
import oracledb from "oracledb"

export async function GET() {
  // GET 요청 처리 함수 정의
  try {
 
    // oracledb.initOracleClient?.({ configDir: undefined })
    
    const conn = await oracledb.getConnection({
      user: process.env.ORACLE_USER,
      password: process.env.ORACLE_PASSWORD,
      connectString: process.env.ORACLE_CONNECTION_STRING,
    })

    const result = await conn.execute(
      `SELECT customer_id AS ID, name AS NAME, email AS EMAIL, position AS POSITION, 
              department AS DEPARTMENT, phone AS PHONE, 
              TRUNC(SYSDATE - contact_date) AS DAYS_SINCE_CONTACT
       FROM CONTACTS
       ORDER BY customer_id`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    )
    
    await conn.close()
    return NextResponse.json(result.rows)
    
  } catch (err) {
    console.error("DB 오류:", err)
    return NextResponse.json(
      { error: "DB 연결 실패", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
