import * as React from "react"
import { RiCalendarEventLine } from "react-icons/ri"
import * as c from "@chakra-ui/react"
import type { ShouldReloadFunction } from "@remix-run/react"
import { useFetcher, useLoaderData } from "@remix-run/react"
import type { UseDataFunctionReturn } from "@remix-run/react/dist/components"
import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/server-runtime"
import dayjs from "dayjs"
import advancedFormat from "dayjs/plugin/advancedFormat"
import throttle from "lodash.throttle"
import styles from "suneditor/dist/css/suneditor.min.css"

import { Day, DAY_WIDTH } from "~/components/Day"
import { DropContainer } from "~/components/DropContainer"
import { Nav } from "~/components/Nav"
import { HEADER_HEIGHT, TimelineHeader } from "~/components/TimelineHeader"
import { getDays, getMonths } from "~/lib/helpers/timeline"
import { isMobile } from "~/lib/helpers/utils"
import { useTimelineDays } from "~/lib/hooks/useTimelineDays"
import { DAYS_BACK, DAYS_FORWARD, useTimelineTasks } from "~/lib/hooks/useTimelineTasks"
import { requireUser } from "~/services/auth/auth.server"
import { getSidebarElements } from "~/services/timeline/sidebar.server"
import { getWeatherData } from "~/services/weather/weather.server"

import type { TimelineTask } from "./api.tasks"

export function links() {
  return [{ rel: "stylesheet", href: styles }]
}

export const unstable_shouldReload: ShouldReloadFunction = ({ submission }) => {
  if (!submission) return false
  return ["/api/elements"].some((path) => submission.action.includes(path))
}

export const loader = async ({ request }: LoaderArgs) => {
  const user = await requireUser(request)

  const [elements, weatherData] = await Promise.all([getSidebarElements(user.id), getWeatherData(request)])
  return json({ elements, weatherData })
}

export type WeatherData = UseDataFunctionReturn<typeof loader>["weatherData"]
export type SidebarElement = UseDataFunctionReturn<typeof loader>["elements"][0]

dayjs.extend(advancedFormat)

export default function Timeline() {
  const { tasks, setTasks } = useTimelineTasks(({ tasks, setTasks }) => ({
    tasks,
    setTasks,
  }))

  const timelineRef = React.useRef<HTMLDivElement>(null)
  const daysRef = React.useRef<HTMLDivElement>(null)
  const { daysForward, daysBack, setDaysBack, setDaysForward } = useTimelineDays()

  React.useEffect(function SetInitialScroll() {
    const scrollTo = isMobile ? DAYS_BACK * DAY_WIDTH : (DAYS_BACK - 3) * DAY_WIDTH
    timelineRef.current?.scrollTo(scrollTo, 0)
  }, [])

  // Polling
  const taskFetcher = useFetcher<TimelineTask[]>()
  React.useEffect(
    function LoadTasksAndPoll() {
      taskFetcher.load(`/api/tasks?back=${daysBack}&forward=${daysForward}`)
      const interval = setInterval(() => {
        taskFetcher.load(`/api/tasks?back=${daysBack}&forward=${daysForward}`)
      }, 30_000)
      return () => {
        clearInterval(interval)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [daysBack, daysForward],
  )

  React.useEffect(() => {
    if (taskFetcher.data) {
      setTasks(taskFetcher.data)
    }
  }, [taskFetcher.data, setTasks])

  const handleForward = () => {
    setDaysForward(daysForward + DAYS_FORWARD)
  }
  const handleBack = () => {
    // Need to scroll a bit right otherwise it keeps running handleBack
    timelineRef.current?.scrollTo({ left: DAYS_BACK * DAY_WIDTH })
    setDaysBack(daysBack + DAYS_BACK)
  }

  const handleScroll = () => {
    if (!daysRef.current || taskFetcher.state === "loading") return
    const right = daysRef.current.getBoundingClientRect().right - DAY_WIDTH <= window.innerWidth
    const left = daysRef.current.getBoundingClientRect().left + DAY_WIDTH >= 0
    if (right) return handleForward()
    if (left) return handleBack()
  }
  c.useEventListener("wheel", throttle(handleScroll, 200, { leading: true, trailing: true }))
  c.useEventListener("touchmove", throttle(handleScroll, 200, { leading: true, trailing: true }))

  const handleJumpToToday = () => {
    const scrollTo = isMobile ? daysBack * DAY_WIDTH : (daysBack - 3) * DAY_WIDTH
    timelineRef.current?.scrollTo(scrollTo, 0)
  }

  const days = React.useMemo(
    () => getDays(dayjs().subtract(daysBack, "day"), daysBack + daysForward),
    [daysBack, daysForward],
  )
  const months = React.useMemo(
    () => getMonths(dayjs().subtract(daysBack, "day"), daysBack + daysForward),
    [daysBack, daysForward],
  )

  const isLoading = taskFetcher.state === "loading"

  const bg = c.useColorModeValue("gray.100", "gray.800")
  const { elements, weatherData } = useLoaderData<typeof loader>()
  return (
    <c.Box ref={timelineRef} w="100vw" h="100vh" overflowX="auto" overflowY="hidden">
      <TimelineHeader weatherData={weatherData} isLoading={isLoading} days={days} months={months} />
      <c.Box ref={daysRef} h={`calc(100vh - ${HEADER_HEIGHT}px)`} w="min-content" overflow="scroll">
        <c.Flex>
          <DropContainer tasks={tasks.map((t) => ({ id: t.id, date: t.date, order: t.order }))}>
            {days.map((day, index) => (
              <Day
                key={day.toISOString() + index}
                isPublic={false}
                {...{ index, day, daysForward, daysBack }}
                tasks={tasks.filter((t) => dayjs(t.date).isSame(dayjs(day), "day"))}
              />
            ))}
          </DropContainer>
        </c.Flex>
      </c.Box>
      <Nav elements={elements} />
      <c.Box pos="absolute" bottom={isMobile ? 24 : 8} left={8} bg={bg} borderRadius="full">
        <c.Tooltip label="Jump to today" placement="auto" zIndex={50} hasArrow>
          <c.IconButton
            size="md"
            borderRadius="full"
            onClick={handleJumpToToday}
            aria-label="Jump to today"
            variant="ghost"
            icon={<c.Box as={RiCalendarEventLine} boxSize="18px" />}
          />
        </c.Tooltip>
      </c.Box>
    </c.Box>
  )
}
