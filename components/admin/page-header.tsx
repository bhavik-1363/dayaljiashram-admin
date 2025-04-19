import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

interface PageHeaderProps {
  title: string
  description?: string
  addNewLabel?: string
  addNewHref?: string
}

export function PageHeader({ title, description, addNewLabel, addNewHref }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {addNewLabel && addNewHref && (
        <Button asChild>
          <Link href={addNewHref}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {addNewLabel}
          </Link>
        </Button>
      )}
    </div>
  )
}
