"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

const thumbBySize = {
  sm: "size-3.5 data-[state=checked]:translate-x-3",
  default: "size-4 data-[state=checked]:translate-x-4",
  lg: "size-[22px] data-[state=checked]:translate-x-5",
} as const

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default" | "lg"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-transparent transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-[#101828]/20 disabled:cursor-not-allowed disabled:opacity-50",
        "data-[size=sm]:h-4 data-[size=sm]:w-7 data-[size=sm]:p-px",
        "data-[size=default]:h-5 data-[size=default]:w-9 data-[size=default]:p-0.5",
        "data-[size=lg]:h-7 data-[size=lg]:w-12 data-[size=lg]:p-[3px]",
        "data-[state=checked]:bg-[#101828] data-[state=unchecked]:bg-[#e4e7ec]",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full bg-white ring-0 transition-transform duration-200 ease-out",
          "shadow-[0_1px_2px_rgba(16,24,40,0.18),0_1px_1px_rgba(16,24,40,0.08)]",
          "data-[state=unchecked]:translate-x-0",
          thumbBySize[size]
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
