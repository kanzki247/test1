import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        order_id,
        contact_id,
        product_id,
        order_date,
        quantity,
        amount,
        cost,
        margin_rate,
        payment_status,
        delivery_status
      `)
      .order("order_date", { ascending: false })

    if (error) {
      console.error("Supabase 오류:", error)
      return NextResponse.json({ error: "데이터 조회 실패", details: error.message }, { status: 500 })
    }

    const processedData = data?.map((order) => ({
      ORDER_ID: order.order_id,
      CONTACT_ID: order.contact_id,
      PRODUCT_ID: order.product_id,
      ORDER_DATE: order.order_date,
      QUANTITY: order.quantity,
      AMOUNT: order.amount,
      COST: order.cost,
      MARGIN_RATE: order.margin_rate,
      PAYMENT_STATUS: order.payment_status,
      DELIVERY_STATUS: order.delivery_status,
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
