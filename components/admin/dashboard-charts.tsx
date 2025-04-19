"use client"

import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const memberData = [
  {
    name: "Jan",
    total: 45,
  },
  {
    name: "Feb",
    total: 32,
  },
  {
    name: "Mar",
    total: 67,
  },
  {
    name: "Apr",
    total: 53,
  },
  {
    name: "May",
    total: 76,
  },
  {
    name: "Jun",
    total: 38,
  },
  {
    name: "Jul",
    total: 43,
  },
  {
    name: "Aug",
    total: 91,
  },
  {
    name: "Sep",
    total: 65,
  },
  {
    name: "Oct",
    total: 88,
  },
  {
    name: "Nov",
    total: 74,
  },
  {
    name: "Dec",
    total: 102,
  },
]

const eventData = [
  {
    name: "Jan",
    total: 3,
  },
  {
    name: "Feb",
    total: 5,
  },
  {
    name: "Mar",
    total: 7,
  },
  {
    name: "Apr",
    total: 4,
  },
  {
    name: "May",
    total: 8,
  },
  {
    name: "Jun",
    total: 6,
  },
  {
    name: "Jul",
    total: 9,
  },
  {
    name: "Aug",
    total: 12,
  },
  {
    name: "Sep",
    total: 8,
  },
  {
    name: "Oct",
    total: 10,
  },
  {
    name: "Nov",
    total: 7,
  },
  {
    name: "Dec",
    total: 11,
  },
]

export function DashboardCharts({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Analytics</CardTitle>
        <CardDescription>Community growth and engagement metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>
          <TabsContent value="members" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={memberData}
                  margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          <TabsContent value="events" className="space-y-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={eventData}
                  margin={{
                    top: 20,
                    right: 0,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
