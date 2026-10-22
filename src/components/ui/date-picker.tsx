"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  className,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  id?: string
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start rounded-md border-input bg-transparent px-3 text-left text-sm font-normal shadow-xs hover:bg-transparent",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 text-[#667085]" />
          {value ? format(value, "MMMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          defaultMonth={value}
        />
      </PopoverContent>
    </Popover>
  )
}
