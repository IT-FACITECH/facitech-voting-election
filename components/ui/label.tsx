"use client"

import * as React from "react"
import { Root } from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

function Label({
  className,
  ...props
}: React.ComponentProps<typeof Root> &
  VariantProps<typeof labelVariants>) {
  return (
    <Root
      data-slot="label"
      className={cn(labelVariants(), className)}
      {...props}
    />
  )
}

export { Label }
