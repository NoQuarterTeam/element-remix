import type { UseDataFunctionReturn } from "@remix-run/react/dist/components"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"

import { db } from "~/lib/db.server"
import { requireUser } from "~/services/auth/auth.server"

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request)
  const url = new URL(request.url)
  const selectedTeamId = url.searchParams.get("selectedTeamId")
  const elements = await db.element.findMany({
    where: {
      archivedAt: { equals: null },
      AND: selectedTeamId
        ? { teamId: { equals: selectedTeamId } }
        : {
            OR: [
              { team: { users: { some: { id: { equals: user.id } } } } },
              { creatorId: { equals: user.id } },
            ],
          },
    },
  })

  return json({ elements })
}

export type TaskElement = UseDataFunctionReturn<typeof loader>["elements"][0]
