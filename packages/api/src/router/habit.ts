import dayjs from "dayjs"
import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "../trpc"

export const habitRouter = createTRPCRouter({
  progressCompleteByDate: protectedProcedure.input(z.object({ date: z.string() })).query(async ({ ctx, input }) => {
    // return percentage of habits completed on given date
    const habits = await ctx.prisma.habit.findMany({
      include: {
        entries: {
          where: { createdAt: { gte: dayjs(input.date).startOf("d").toDate(), lte: dayjs(input.date).endOf("d").toDate() } },
        },
      },
      where: {
        OR: [{ archivedAt: { equals: null } }, { archivedAt: { gte: dayjs(input.date).endOf("day").toDate() } }],
        startDate: { lt: dayjs(input.date).endOf("day").toDate() },
        creatorId: { equals: ctx.user.id },
      },
    })
    const total = habits.length
    const completed = habits.filter((h) => h.entries.length > 0).length
    return Math.round((completed / total) * 100)
  }),
  all: protectedProcedure.input(z.object({ date: z.string() })).query(async ({ ctx, input }) => {
    const [habits, habitEntries] = await Promise.all([
      ctx.prisma.habit.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, startDate: true, archivedAt: true },
        where: {
          OR: [{ archivedAt: { equals: null } }, { archivedAt: { gte: dayjs(input.date).endOf("day").toDate() } }],
          startDate: { lt: dayjs(input.date).endOf("day").toDate() },
          creatorId: { equals: ctx.user.id },
        },
      }),
      ctx.prisma.habitEntry.findMany({
        select: { id: true, habitId: true, createdAt: true },
        where: {
          creatorId: { equals: ctx.user.id },
          createdAt: {
            gte: dayjs(input.date).startOf("d").toDate(),
            lte: dayjs(input.date).endOf("d").toDate(),
          },
        },
      }),
    ])
    return { habits, habitEntries }
  }),
  create: protectedProcedure.input(z.object({ name: z.string(), color: z.string() })).mutation(({ ctx, input }) => {
    return ctx.prisma.element.create({ data: { ...input, creatorId: ctx.user.id } })
  }),
  toggleComplete: protectedProcedure.input(z.object({ id: z.string(), date: z.string() })).mutation(async ({ ctx, input }) => {
    const now = dayjs()
    const date = dayjs(input.date)
      .set("hour", now.get("hour"))
      .set("minute", now.get("minute"))
      .set("second", now.get("second"))
      .set("millisecond", now.get("millisecond"))
      .toDate()
    const gte = dayjs(input.date).startOf("d").toDate()
    const lte = dayjs(input.date).endOf("d").toDate()

    const entries = await ctx.prisma.habitEntry.findMany({
      select: { id: true },
      where: { creatorId: { equals: ctx.user.id }, habitId: { equals: input.id }, createdAt: { gte, lte } },
    })

    if (entries.length > 0) {
      await ctx.prisma.habitEntry.deleteMany({ where: { id: { in: entries.map((e) => e.id) } } })
    } else {
      await ctx.prisma.habitEntry.create({ data: { creatorId: ctx.user.id, habitId: input.id, createdAt: date } })
    }
    return true
  }),
})