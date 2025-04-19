"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface TagsInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
}

export function TagsInput({ value = [], onChange, placeholder = "Add tags..." }: TagsInputProps) {
  const [inputValue, setInputValue] = useState("")
  const inputRef = useRef(null)

  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      removeTag(value.length - 1)
    }
  }

  const addTag = () => {
    const tag = inputValue.trim()
    if (tag === "") return

    // Check for duplicates
    if (value.includes(tag)) {
      toast({
        title: "Duplicate tag",
        description: "This tag has already been added",
        variant: "destructive",
      })
      setInputValue("")
      return
    }

    if (tag && !value.includes(tag)) {
      onChange([...value, tag])
      setInputValue("")
    }
  }

  const removeTag = (index) => {
    const newTags = [...value]
    newTags.splice(index, 1)
    onChange(newTags)
  }

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    } else if (e.key === "Backspace" && inputValue === "" && value.length > 0) {
      // Remove the last tag when backspace is pressed and input is empty
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className="flex flex-wrap gap-2 p-2 border rounded-md min-h-10 focus-within:ring-1 focus-within:ring-ring"
      onClick={handleContainerClick}
    >
      {value.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1 px-2 py-1">
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(index)
            }}
            className="rounded-full hover:bg-muted-foreground/20 p-0.5"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        aria-label="Add tags"
      />
    </div>
  )
}
