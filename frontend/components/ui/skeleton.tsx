import type React from "react"
import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-gradient-to-r from-muted via-accent/20 to-muted rounded-md animate-shimmer",
        "bg-[length:200%_100%]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
