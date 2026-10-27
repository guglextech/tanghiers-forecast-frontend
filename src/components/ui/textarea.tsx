import * as React from "react"

import { controlRadius, fieldFocus } from "@/components/ui/field"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        `flex min-h-20 w-full min-w-0 ${controlRadius} border border-input bg-transparent px-3 py-2 text-base shadow-none outline-none placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30`,
        fieldFocus,
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
