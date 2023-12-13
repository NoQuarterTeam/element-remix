import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { FlashType, getFlashSession } from "~/services/session/flash.server"
import { getUserSession } from "~/services/session/session.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  const { destroy } = await getUserSession(request)
  const { createFlash } = await getFlashSession(request)
  const headers = new Headers([
    ["Set-Cookie", await destroy()],
    ["Set-Cookie", await createFlash(FlashType.Info, "Logged out!", "See you soon!")],
  ])
  return redirect("/login", { headers })
}

export const loader = () => redirect("/login")
