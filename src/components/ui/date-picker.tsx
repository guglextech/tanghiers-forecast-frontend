"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

function yearsBetween(start?: Date, end?: Date) {
  const max = (end ?? new Date()).getFullYear()
  const min = (start ?? new Date(max - 100, 0, 1)).getFullYear()
  const years: number[] = []
  for (let year = max; year >= min; year -= 1) years.push(year)
  return years
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  id,
  className,
  captionLayout,
  startMonth,
  endMonth,
  disabled,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  id?: string
  className?: string
  captionLayout?: React.ComponentProps<typeof Calendar>["captionLayout"]
  startMonth?: Date
  endMonth?: Date
  disabled?: React.ComponentProps<typeof Calendar>["disabled"]
}) {
  const [open, setOpen] = React.useState(false)
  const [month, setMonth] = React.useState<Date>(value ?? endMonth ?? new Date())
  const dropdowns =
    captionLayout === "dropdown" ||
    captionLayout === "dropdown-years" ||
    captionLayout === "dropdown-months"
  const years = yearsBetween(startMonth, endMonth)

  React.useEffect(() => {
    if (value) setMonth(value)
  }, [value])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn(
            "h-9 w-full justify-start rounded-md border-input bg-transparent px-3 text-left text-sm font-normal shadow-none hover:bg-transparent focus-visible:border-foreground focus-visible:ring-0",
            !value && "text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="size-4 text-[#667085]" />
          {value ? format(value, "MMMM d, yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onInteractOutside={(event) => {
          const target = event.target as HTMLElement | null
          if (target?.closest('[data-slot="select-content"]')) event.preventDefault()
        }}
      >
        {dropdowns ? (
          <div className="flex gap-2 px-3 pt-3">
            {captionLayout !== "dropdown-years" ? (
              <Select
                value={String(month.getMonth())}
                onValueChange={(next) => setMonth(new Date(month.getFullYear(), Number(next), 1))}
              >
                <SelectTrigger aria-label="Month" className="h-9 flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  {MONTHS.map((label, index) => (
                    <SelectItem key={label} value={String(index)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
            {captionLayout !== "dropdown-months" ? (
              <Select
                value={String(month.getFullYear())}
                onValueChange={(next) => setMonth(new Date(Number(next), month.getMonth(), 1))}
              >
                <SelectTrigger aria-label="Year" className="h-9 w-[6.25rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[60] max-h-64">
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        ) : null}
        <Calendar
          mode="single"
          selected={value}
          month={month}
          onMonthChange={setMonth}
          onSelect={(date) => {
            onChange(date)
            setOpen(false)
          }}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={disabled}
          hideNavigation={dropdowns}
          classNames={dropdowns ? { month_caption: "hidden" } : undefined}
        />
      </PopoverContent>
    </Popover>
  )
}
