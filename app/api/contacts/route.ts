import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("contacts")
      .select(`
        customer_id,
        name,
        email,
        position,
        department,
        phone,
        contact_date
      `)
      .order("customer_id")

    if (error) {
      console.error("Supabase 오류:", error)
      return NextResponse.json({ error: "데이터 조회 실패", details: error.message }, { status: 500 })
    }

    // 날짜 계산 추가
    const processedData = data?.map((contact) => ({
      ID: contact.customer_id,
      NAME: contact.name,
      EMAIL: contact.email,
      POSITION: contact.position,
      DEPARTMENT: contact.department,
      PHONE: contact.phone,
      DAYS_SINCE_CONTACT: contact.contact_date
        ? Math.floor((new Date().getTime() - new Date(contact.contact_date).getTime()) / (1000 * 60 * 60 * 24))
        : 0,
    }))

    return NextResponse.json(processedData)
  } catch (err) {
    console.error("DB 오류:", err)
    return NextResponse.json(
      { error: "DB 연결 실패", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
