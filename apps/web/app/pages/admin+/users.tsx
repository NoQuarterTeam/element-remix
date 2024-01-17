import { Link, json, useLoaderData } from "@remix-run/react"
import { createColumnHelper } from "@tanstack/react-table"
import dayjs from "dayjs"
import { promiseHash } from "remix-utils/promise"

import { type Prisma } from "@element/database/types"
import { createImageUrl } from "@element/shared"

import { Search } from "~/components/ui/Search"
import { Table } from "~/components/ui/Table"
import { Avatar } from "~/components/ui/Avatar"
import { db } from "~/lib/db.server"

import { getTableParams } from "~/lib/table"
import { LoaderFunctionArgs, SerializeFrom } from "@remix-run/node"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { orderBy, search, skip, take } = getTableParams(request)
  const where = {
    OR: search
      ? [{ email: { contains: search } }, { firstName: { contains: search } }, { lastName: { contains: search } }]
      : undefined,
  } satisfies Prisma.UserWhereInput

  const data = await promiseHash({
    users: db.user.findMany({
      orderBy,
      skip,
      take,
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        createdAt: true,
        _count: { select: { tasks: true, elements: true, habits: true } },
      },
    }),
    count: db.user.count({ where }),
  })
  return json(data)
}

type User = SerializeFrom<typeof loader>["users"][number]

const columnHelper = createColumnHelper<User>()
const columns = [
  columnHelper.accessor("firstName", {
    id: "firstName",
    header: () => "First name",
    cell: (info) => (
      <Link to={`/${info.row.original.id}`} className="flex items-center space-x-2">
        <Avatar
          className="sq-10"
          src={createImageUrl(info.row.original.avatar)}
          // placeholder={info.row.original.avatarBlurHash}
          size={60}
        />
        <p>{info.getValue()}</p>
      </Link>
    ),
  }),
  columnHelper.accessor("lastName", {
    id: "lastName",
    header: () => "Last name",
    cell: (info) => <Link to={`/${info.row.original.id}`}>{info.getValue()}</Link>,
  }),
  columnHelper.accessor("email", {
    id: "email",
    header: () => "Email",
    cell: (info) => <Link to={`/${info.row.original.id}`}>{info.getValue()}</Link>,
  }),
  columnHelper.accessor("createdAt", {
    id: "createdAt",
    header: () => "Created",
    cell: (info) => <Link to={`/${info.row.original.id}`}>{dayjs(info.getValue()).format("DD/MM/YYYY")}</Link>,
  }),
]
export default function Users() {
  const { users, count } = useLoaderData<typeof loader>()
  return (
    <div className="space-y-2">
      <h1 className="text-4xl">Users</h1>
      <div className="flex gap-2">
        <div>
          <Search className="max-w-[400px]" />
        </div>
      </div>
      <Table data={users} count={count} columns={columns} />
    </div>
  )
}