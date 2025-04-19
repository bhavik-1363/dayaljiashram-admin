import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    user: "Rajesh Patel",
    action: "added a new member",
    target: "Amit Shah",
    time: "2 hours ago",
    avatar: "/abstract-geometric-shapes.png",
  },
  {
    user: "Priya Sharma",
    action: "booked party plot",
    target: "Golden Hall",
    time: "5 hours ago",
    avatar: "/playstation-controller-closeup.png",
  },
  {
    user: "Vikram Mehta",
    action: "published news",
    target: "Community Diwali Celebration",
    time: "1 day ago",
    avatar: "/virtual-meeting-diversity.png",
  },
  {
    user: "Neha Joshi",
    action: "updated matrimonial profile",
    target: "",
    time: "1 day ago",
    avatar: "/placeholder.svg?height=32&width=32&query=NJ",
  },
  {
    user: "Suresh Kumar",
    action: "created event",
    target: "Annual General Meeting",
    time: "2 days ago",
    avatar: "/placeholder.svg?height=32&width=32&query=SK",
  },
  {
    user: "Anita Desai",
    action: "approved membership",
    target: "3 new members",
    time: "3 days ago",
    avatar: "/placeholder.svg?height=32&width=32&query=AD",
  },
]

export function DashboardActivity({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest actions in the community</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {activities.map((activity, index) => (
            <div className="flex items-center" key={index}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={activity.avatar || "/placeholder.svg"} alt={activity.user} />
                <AvatarFallback>
                  {activity.user
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 space-y-1">
                <p className="text-sm font-medium leading-none">{activity.user}</p>
                <p className="text-sm text-muted-foreground">
                  {activity.action}{" "}
                  {activity.target && <span className="font-medium text-foreground">{activity.target}</span>}
                </p>
              </div>
              <div className="ml-auto text-xs text-muted-foreground">{activity.time}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
