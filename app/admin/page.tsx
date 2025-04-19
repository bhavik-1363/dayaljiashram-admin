import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DashboardCharts } from "@/components/admin/dashboard-charts"
import { DashboardActivity } from "@/components/admin/dashboard-activity"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>
      <DashboardStats />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <DashboardCharts className="lg:col-span-4" />
        <DashboardActivity className="lg:col-span-3" />
      </div>
    </div>
  )
}
