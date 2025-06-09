import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select(`
        customer_id,
        company_name,
        company_type,
        region,
        reg_date,
        industry_type,
        country,
        company_size
      `)
      .order("customer_id")

    if (error) {
      console.error("Supabase 오류:", error)
      return NextResponse.json({ error: "데이터 조회 실패", details: error.message }, { status: 500 })
    }

    const processedData = data?.map((customer) => ({
      CUSTOMER_ID: customer.customer_id,
      COMPANY_NAME: customer.company_name,
      COMPANY_TYPE: customer.company_type,
      REGION: customer.region,
      REG_DATE: customer.reg_date,
      INDUSTRY_TYPE: customer.industry_type,
      COUNTRY: customer.country,
      COMPANY_SIZE: customer.company_size,
    }))

    return NextResponse.json(processedData, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (err) {
    console.error("DB 오류:", err)
    return NextResponse.json(
      { error: "DB 연결 실패", details: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 },
    )
  }
}
