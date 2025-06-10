"use client"

import { useState, useEffect } from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--chart-1))",
  },
  costt: {
    label: "Cost",
    color: "hsl(var(--chart-2))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-3))",
  },
}

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = useState("90d")
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrdersData()
  }, [timeRange])

  const fetchOrdersData = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/ordersx")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // 날짜별로 데이터 그룹화 및 집계
      const groupedData = data.reduce((acc: any, order: any) => {
        const date = order.ORDER_DATE
        if (!acc[date]) {
          acc[date] = {
            date,
            amount: 0,
            costt: 0,
            revenue: 0,
          }
        }
        acc[date].amount += order.AMOUNT || 0
        acc[date].costt += order.COSTT || 0
        acc[date].revenue += order.REVENUE || 0
        return acc
      }, {})

      // 배열로 변환하고 날짜순 정렬
      const processedData = Object.values(groupedData).sort(
        (a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      )

      // 시간 범위에 따른 필터링
      const now = new Date()
      const filteredData = processedData.filter((item: any) => {
        const itemDate = new Date(item.date)
        const daysDiff = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24))

        switch (timeRange) {
          case "30d":
            return daysDiff <= 30
          case "7d":
            return daysDiff <= 7
          case "90d":
          default:
            return daysDiff <= 90
        }
      })

      setChartData(filteredData)
    } catch (error) {
      console.error("Error fetching orders data:", error)
      setChartData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
          <div className="grid flex-1 gap-1 text-center sm:text-left">
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Showing sales data for the last 3 months</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>Sales Overview</CardTitle>
          <CardDescription>Showing sales data for the last 3 months</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant={timeRange === "7d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("7d")}>
            7 days
          </Button>
          <Button variant={timeRange === "30d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("30d")}>
            30 days
          </Button>
          <Button variant={timeRange === "90d" ? "default" : "outline"} size="sm" onClick={() => setTimeRange("90d")}>
            Last 3 months
          </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillCostt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-costt)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-costt)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <YAxis />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                  />
                }
              />
              <Area
                dataKey="revenue"
                type="natural"
                fill="url(#fillRevenue)"
                fillOpacity={0.4}
                stroke="var(--color-revenue)"
                stackId="a"
              />
              <Area
                dataKey="costt"
                type="natural"
                fill="url(#fillCostt)"
                fillOpacity={0.4}
                stroke="var(--color-costt)"
                stackId="a"
              />
              <Area
                dataKey="amount"
                type="natural"
                fill="url(#fillAmount)"
                fillOpacity={0.4}
                stroke="var(--color-amount)"
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
