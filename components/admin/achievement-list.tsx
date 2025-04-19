"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Plus } from "lucide-react"

export function AchievementList({ achievements = [], onChange }) {
  const [newAchievement, setNewAchievement] = useState("")

  const handleAddAchievement = () => {
    if (newAchievement.trim()) {
      const updatedAchievements = [...achievements, newAchievement.trim()]
      onChange(updatedAchievements)
      setNewAchievement("")
    }
  }

  const handleRemoveAchievement = (index) => {
    const updatedAchievements = achievements.filter((_, i) => i !== index)
    onChange(updatedAchievements)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddAchievement()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={newAchievement}
          onChange={(e) => setNewAchievement(e.target.value)}
          placeholder="Add a new achievement"
          onKeyDown={handleKeyDown}
        />
        <Button type="button" onClick={handleAddAchievement} disabled={!newAchievement.trim()}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        {achievements.length > 0 ? (
          achievements.map((achievement, index) => (
            <div key={index} className="flex items-center gap-2 bg-muted p-2 rounded-md">
              <span className="flex-1 text-sm">{achievement}</span>
              <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveAchievement(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">No achievements added yet</p>
        )}
      </div>
    </div>
  )
}
