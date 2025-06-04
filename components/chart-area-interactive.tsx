"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// 주문 데이터 기반 차트 데이터 (amount, profit, margin)
const chartData = [
  { date: "2024-04-01", amount: 45000, profit: 9000, margin: 4500 },
  { date: "2024-04-02", amount: 52000, profit: 10400, margin: 5200 },
  { date: "2024-04-03", amount: 38000, profit: 7600, margin: 3800 },
  { date: "2024-04-04", amount: 61000, profit: 12200, margin: 6100 },
  { date: "2024-04-05", amount: 73000, profit: 14600, margin: 7300 },
  { date: "2024-04-06", amount: 68000, profit: 13600, margin: 6800 },
  { date: "2024-04-07", amount: 55000, profit: 11000, margin: 5500 },
  { date: "2024-04-08", amount: 82000, profit: 16400, margin: 8200 },
  { date: "2024-04-09", amount: 29000, profit: 5800, margin: 2900 },
  { date: "2024-04-10", amount: 47000, profit: 9400, margin: 4700 },
  { date: "2024-04-11", amount: 65000, profit: 13000, margin: 6500 },
  { date: "2024-04-12", amount: 58000, profit: 11600, margin: 5800 },
  { date: "2024-04-13", amount: 71000, profit: 14200, margin: 7100 },
  { date: "2024-04-14", amount: 43000, profit: 8600, margin: 4300 },
  { date: "2024-04-15", amount: 39000, profit: 7800, margin: 3900 },
  { date: "2024-04-16", amount: 41000, profit: 8200, margin: 4100 },
  { date: "2024-04-17", amount: 89000, profit: 17800, margin: 8900 },
  { date: "2024-04-18", amount: 76000, profit: 15200, margin: 7600 },
  { date: "2024-04-19", amount: 51000, profit: 10200, margin: 5100 },
  { date: "2024-04-20", amount: 33000, profit: 6600, margin: 3300 },
  { date: "2024-04-21", amount: 42000, profit: 8400, margin: 4200 },
  { date: "2024-04-22", amount: 48000, profit: 9600, margin: 4800 },
  { date: "2024-04-23", amount: 44000, profit: 8800, margin: 4400 },
  { date: "2024-04-24", amount: 79000, profit: 15800, margin: 7900 },
  { date: "2024-04-25", amount: 56000, profit: 11200, margin: 5600 },
  { date: "2024-04-26", amount: 31000, profit: 6200, margin: 3100 },
  { date: "2024-04-27", amount: 84000, profit: 16800, margin: 8400 },
  { date: "2024-04-28", amount: 37000, profit: 7400, margin: 3700 },
  { date: "2024-04-29", amount: 63000, profit: 12600, margin: 6300 },
  { date: "2024-04-30", amount: 91000, profit: 18200, margin: 9100 },
]

const chartConfig = {
  amount: {
    label: "Total Amount",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit (Amount - Cost)",
    color: "hsl(var(--chart-2))",
  },
  margin: {
    label: "Margin Revenue",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-04-30")
    let daysToSubtract = 30
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Sales Analytics</CardTitle>
        <CardDescription>
          <span className="@[540px]/card:block hidden">Revenue, profit, and margin analysis</span>
          <span className="@[540px]/card:hidden">Sales overview</span>
        </CardDescription>
        <div className="absolute right-4 top-4">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="@[767px]/card:flex hidden"
          >
            <ToggleGroupItem value="30d" className="h-8 px-2.5">
              Last 30 days
            </ToggleGroupItem>
            <ToggleGroupItem value="7d" className="h-8 px-2.5">
              Last 7 days
            </ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="@[767px]/card:hidden flex w-40" aria-label="Select a value">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAmount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-amount)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-amount)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-profit)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-profit)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillMargin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-margin)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-margin)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
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
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="amount" type="natural" fill="url(#fillAmount)" stroke="var(--color-amount)" stackId="a" />
            <Area dataKey="profit" type="natural" fill="url(#fillProfit)" stroke="var(--color-profit)" stackId="b" />
            <Area dataKey="margin" type="natural" fill="url(#fillMargin)" stroke="var(--color-margin)" stackId="c" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
