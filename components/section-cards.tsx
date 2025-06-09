"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  완성차: { label: "완성차", color: "hsl(var(--chart-1))" },
  유통: { label: "유통", color: "hsl(var(--chart-2))" },
  정비소: { label: "정비소", color: "hsl(var(--chart-3))" },
  렌터카: { label: "렌터카", color: "hsl(var(--chart-4))" },
}

const forecastConfig = {
  predicted_quantity: {
    label: "Predicted Quantity",
    color: "hsl(var(--chart-1))",
  },
}

export function SectionCards() {
  const [salesData, setSalesData] = useState([])
  const [forecastData, setForecastData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalesData()
    fetchForecastData()
  }, [])

  const fetchSalesData = async () => {
    try {
      // OrdersX, Contacts, Customers 데이터를 조합하여 회사 유형별 매출 계산
      const [ordersResponse, contactsResponse, customersResponse] = await Promise.all([
        fetch("/api/ordersx"),
        fetch("/api/contacts"),
        fetch("/api/customers"),
      ])

      const orders = await ordersResponse.json()
      const contacts = await contactsResponse.json()
      const customers = await customersResponse.json()

      // 현재 월 (5월) 데이터만 필터링
      const currentMonth = new Date().getMonth() + 1 // 6월이지만 데이터는 5월까지
      const targetMonth = 5 // 5월 데이터 사용

      const currentMonthOrders = orders.filter((order: any) => {
        const orderDate = new Date(order.ORDER_DATE)
        return orderDate.getMonth() + 1 === targetMonth && orderDate.getFullYear() === 2025
      })

      // 회사 유형별 매출 집계
      const salesByType: { [key: string]: number } = {}

      currentMonthOrders.forEach((order: any) => {
        const contact = contacts.find((c: any) => c.ID === order.CONTACT_ID)
        if (contact) {
          const customer = customers.find((cust: any) => cust.CUSTOMER_ID === contact.ID)
          if (customer) {
            const companyType = customer.COMPANY_TYPE
            if (!salesByType[companyType]) {
              salesByType[companyType] = 0
            }
            salesByType[companyType] += order.AMOUNT || 0
          }
        }
      })

      // 차트 데이터 형식으로 변환
      const chartData = Object.entries(salesByType).map(([type, amount]) => ({
        type,
        amount,
        fill: chartConfig[type as keyof typeof chartConfig]?.color || "hsl(var(--chart-5))",
      }))

      setSalesData(chartData)
    } catch (error) {
      console.error("Error fetching sales data:", error)
      setSalesData([])
    }
  }

  const fetchForecastData = async () => {
    try {
      const response = await fetch("/api/customer-order-forecast")
      const data = await response.json()

      // 월별로 예측 수량 집계 (5월-10월)
      const monthlyForecast: { [key: string]: number } = {}

      data.forEach((forecast: any) => {
        const date = new Date(forecast.PREDICTED_DATE)
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        if (!monthlyForecast[monthKey]) {
          monthlyForecast[monthKey] = 0
        }
        monthlyForecast[monthKey] += forecast.PREDICTED_QUANTITY || 0
      })

      // 차트 데이터 형식으로 변환
      const chartData = Object.entries(monthlyForecast)
        .map(([month, quantity]) => ({
          month,
          predicted_quantity: quantity,
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())

      setForecastData(chartData)
    } catch (error) {
      console.error("Error fetching forecast data:", error)
      setForecastData([])
    } finally {
      setLoading(false)
    }
  }

  const totalSales = salesData.reduce((sum: number, item: any) => sum + item.amount, 0)

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-32">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Sales Category</CardTitle>
          <CardDescription>May 2025</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie data={salesData} dataKey="amount" nameKey="type" innerRadius={60} strokeWidth={5}>
                  {salesData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Total Sales: ₩{(totalSales / 1000000).toFixed(2)}M
          </div>
          <div className="leading-none text-muted-foreground">Company type breakdown for current month</div>
        </CardFooter>
      </Card>

      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Sales Forecast</CardTitle>
          <CardDescription>May - October 2025</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer config={forecastConfig} className="mx-auto aspect-square max-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecastData}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="predicted_quantity" fill="var(--color-predicted_quantity)" radius={8} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 12% this period <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">6-month sales quantity forecast</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20m9-9H3" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">₩45,231.89</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+2,350</div>
          <p className="text-xs text-muted-foreground">+180.1% from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}
