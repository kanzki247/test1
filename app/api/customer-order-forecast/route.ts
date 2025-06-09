import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("customer_order_forecast")
      .select(`
        cof_id,
        customer_id,
        predicted_date,
        predicted_quantity,
        mape,
        prediction_model,
        forecast_generation_datetime
      `)
      .order("predicted_date")

    if (error) {
      console.error("Supabase 오류:", error)
      return NextResponse.json({ error: "데이터 조회 실패", details: error.message }, { status: 500 })
    }

    const processedData = data?.map((forecast) => ({
      COF_ID: forecast.cof_id,
      CUSTOMER_ID: forecast.customer_id,
      PREDICTED_DATE: forecast.predicted_date,
      PREDICTED_QUANTITY: forecast.predicted_quantity,
      MAPE: forecast.mape,
      PREDICTION_MODEL: forecast.prediction_model,
      FORECAST_GENERATION_DATETIME: forecast.forecast_generation_datetime,
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
