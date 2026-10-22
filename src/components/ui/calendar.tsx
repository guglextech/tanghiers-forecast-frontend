"use client"

import * as React from "react"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>["variant"]
}) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-fit bg-white p-3 [--cell-size:2.25rem]", className)}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) => date.toLocaleString("default", { month: "short" }),
        ...formatters,
      }}
      classNames={{
        months: "relative flex flex-col",
        month: "flex flex-col gap-3",
        month_caption: "relative flex h-8 items-center justify-center",
        caption_label: "text-sm font-medium",
        nav: "pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between",
        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto size-8 rounded-md p-0",
        ),
        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          "pointer-events-auto size-8 rounded-md p-0",
        ),
        month_grid: "w-[calc(var(--cell-size)*7)] table-fixed border-separate border-spacing-0",
        weekdays: "",
        weekday:
          "h-(--cell-size) w-(--cell-size) p-0 text-center text-[0.75rem] font-medium text-[#98a2b3]",
        week: "",
        day: "relative h-(--cell-size) w-(--cell-size) p-0 text-center text-sm",
        day_button: cn(
          "flex h-(--cell-size) w-(--cell-size) items-center justify-center rounded-md text-sm text-[#101828] hover:bg-[#f4f6f8]",
        ),
        selected:
          "rounded-md bg-[#101828] text-white [&>button]:bg-[#101828] [&>button]:text-white [&>button]:hover:bg-[#101828]",
        today: "[&>button]:font-semibold",
        outside: "text-[#98a2b3] [&>button]:text-[#98a2b3]",
        disabled: "opacity-40",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === "left") {
            return <ChevronLeftIcon className={cn("size-4", className)} {...props} />
          }
          if (orientation === "right") {
            return <ChevronRightIcon className={cn("size-4", className)} {...props} />
          }
          return <ChevronDownIcon className={cn("size-4", className)} {...props} />
        },
        ...components,
      }}
      {...props}
    />
  )
}

export { Calendar }
