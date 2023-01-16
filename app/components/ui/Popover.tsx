import * as React from "react"
import * as Popover from "@radix-ui/react-popover"
import { cn } from "~/lib/tailwind"

export * from "@radix-ui/react-popover"

export const Content = React.forwardRef<HTMLDivElement, Popover.PopoverContentProps>(function _Content(props, ref) {
  return (
    <Popover.Content
      ref={ref}
      {...props}
      className={cn(
        "w-80 rounded-sm border border-gray-100 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700",
        props.className,
      )}
    >
      {props.children}
    </Popover.Content>
  )
})
export const Arrow = React.forwardRef<SVGSVGElement, Popover.PopperArrowProps>(function Arrow(props, ref) {
  return <Popover.Arrow ref={ref} {...props} className={cn("fill-white dark:fill-gray-700", props.className)} />
})
