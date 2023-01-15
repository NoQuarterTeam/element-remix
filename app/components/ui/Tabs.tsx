import { type NavLinkProps, NavLink as RNavLink } from "@remix-run/react"
import { twMerge } from "tailwind-merge"

export function TabLink(props: NavLinkProps) {
  return (
    <RNavLink
      {...props}
      className={({ isActive, isPending }) =>
        twMerge(
          "border-b-2 pb-1 font-body text-lg hover:opacity-70",
          isActive ? "border-primary-500 text-primary-500" : "border-transparent text-white",
          typeof props.className === "string" ? props.className : props.className?.({ isActive, isPending }),
        )
      }
    >
      {props.children}
    </RNavLink>
  )
}

export function Tabs(props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) {
  return (
    <div {...props} className={twMerge("hstack space-x-6 border-b border-gray-700", props.className)}>
      {props.children}
    </div>
  )
}
