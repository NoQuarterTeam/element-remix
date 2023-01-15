import { createCookieSessionStorage } from "@remix-run/node"

import { IS_PRODUCTION } from "~/lib/config"
import { SESSION_SECRET } from "~/lib/config.server"

export const COOKIE_KEY = IS_PRODUCTION ? "element_session" : "element_session_dev"

const userStorage = createCookieSessionStorage({
  cookie: {
    name: COOKIE_KEY,
    secure: IS_PRODUCTION,
    secrets: [SESSION_SECRET],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
})

export async function getUserSession(request: Request) {
  const session = await userStorage.getSession(request.headers.get("Cookie"))
  const commit = () => userStorage.commitSession(session)
  const destroy = () => userStorage.destroySession(session)
  let userId: string | null = session.get("userId") || null
  const setUser = (id: string) => {
    session.set("userId", id)
    return commit()
  }
  return { commit, destroy, session, setUser, userId }
}
