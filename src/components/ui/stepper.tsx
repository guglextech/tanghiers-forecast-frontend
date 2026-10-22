import * as React from "react"

import { cn } from "@/lib/utils"

type StepState = "completed" | "active" | "pending"

/**
 * Vertical stepper primitives (shadcn-style composable slots).
 *
 * <Stepper>
 *   <StepperItem state="completed">
 *     <StepperRail>
 *       <StepperIndicator>1</StepperIndicator>
 *       <StepperSeparator />
 *     </StepperRail>
 *     <StepperContent>
 *       <StepperTitle>Step title</StepperTitle>
 *       <StepperDescription>Details</StepperDescription>
 *     </StepperContent>
 *   </StepperItem>
 * </Stepper>
 *
 * States style the indicator and connector automatically:
 * - completed: filled accent circle, accent connector
 * - active:    filled dark circle
 * - pending:   muted circle (default)
 */

function Stepper({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<"ol"> & { orientation?: "vertical" | "horizontal" }) {
  return (
    <ol
      data-slot="stepper"
      data-orientation={orientation}
      className={cn(
        "group/stepper flex",
        orientation === "vertical" ? "flex-col" : "w-full flex-row items-center",
        className,
      )}
      {...props}
    />
  )
}

function StepperItem({
  className,
  state = "pending",
  ...props
}: React.ComponentProps<"li"> & { state?: StepState }) {
  return (
    <li
      data-slot="stepper-item"
      data-state={state}
      className={cn(
        "group/step relative flex gap-3",
        "group-data-[orientation=horizontal]/stepper:min-w-0 group-data-[orientation=horizontal]/stepper:flex-1 group-data-[orientation=horizontal]/stepper:items-center group-data-[orientation=horizontal]/stepper:last:flex-none",
        className,
      )}
      {...props}
    />
  )
}

/** Left column holding the indicator and the connecting line. */
function StepperRail({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-rail"
      className={cn("flex flex-col items-center self-stretch", className)}
      {...props}
    />
  )
}

function StepperIndicator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-indicator"
      className={cn(
        "z-[1] grid size-7 shrink-0 place-items-center rounded-full text-xs font-semibold transition-colors",
        // pending (default)
        "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
        // active
        "group-data-[state=active]/step:bg-primary group-data-[state=active]/step:text-primary-foreground group-data-[state=active]/step:ring-0",
        // completed
        "group-data-[state=completed]/step:bg-primary group-data-[state=completed]/step:text-primary-foreground group-data-[state=completed]/step:ring-0",
        className
      )}
      {...props}
    />
  )
}

/** Vertical connector; hidden automatically on the last step. */
function StepperSeparator({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="stepper-separator"
      className={cn(
        "my-1 w-px flex-1 rounded-full bg-border transition-colors group-last/step:hidden",
        "group-data-[state=completed]/step:bg-primary",
        "group-data-[orientation=horizontal]/stepper:mx-3 group-data-[orientation=horizontal]/stepper:my-0 group-data-[orientation=horizontal]/stepper:h-px group-data-[orientation=horizontal]/stepper:w-auto group-data-[orientation=horizontal]/stepper:self-center",
        className
      )}
      {...props}
    />
  )
}

function StepperContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="stepper-content"
      className={cn("min-w-0 flex-1 pb-6 group-last/step:pb-0", className)}
      {...props}
    />
  )
}

function StepperTitle({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="stepper-title"
      className={cn(
        "text-sm font-medium text-foreground",
        "group-data-[state=active]/step:font-semibold",
        className
      )}
      {...props}
    />
  )
}

function StepperDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="stepper-description"
      className={cn("mt-0.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Stepper,
  StepperItem,
  StepperRail,
  StepperIndicator,
  StepperSeparator,
  StepperContent,
  StepperTitle,
  StepperDescription,
  type StepState,
}
