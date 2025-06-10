import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("issues")
      .select(`
        issue_id,
        order_id,
        issue_date,
        issue_type,
        severity,
        description,
        resolved_date,
        status
      `)
      .order("issue_date", { ascending: false })

    if (error) {
      console.error("Supabase 오류:", error)
      return NextResponse.json({ error: "데이터 조회 실패", details: error.message }, { status: 500 })
    }

    const processedData = data?.map((issue) => ({
      ISSUE_ID: issue.issue_id,
      ORDER_ID: issue.order_id,
      ISSUE_DATE: issue.issue_date,
      ISSUE_TYPE: issue.issue_type,
      SEVERITY: issue.severity,
      DESCRIPTION: issue.description,
      RESOLVED_DATE: issue.resolved_date,
      STATUS: issue.status,
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
