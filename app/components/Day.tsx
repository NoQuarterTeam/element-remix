import * as React from "react"
import { Draggable, Droppable } from "react-beautiful-dnd"
import { IoIosAddCircleOutline } from "react-icons/io"
import * as c from "@chakra-ui/react"
import dayjs from "dayjs"
import deepEqual from "deep-equal"

import { HEADER_HEIGHT } from "~/pages/_timeline.index"
import type { TimelineTask } from "~/pages/api.tasks"

import { TaskForm } from "./TaskForm"
import { TaskItem } from "./TaskItem"

interface Props {
  day: dayjs.Dayjs
  index: number
  tasks: TimelineTask[]
  daysForward: number
  daysBack: number
}

export const DAY_WIDTH = 98

function _Day(props: Props) {
  const modalProps = c.useDisclosure()

  c.useEventListener("keydown", (event) => {
    // cmd + . to open the add task modal for current day
    if (!dayjs(props.day).isSame(dayjs(), "day")) return
    if (event.metaKey && event.key === ".") {
      event.preventDefault()
      modalProps.onOpen()
    }
  })

  const { colorMode } = c.useColorMode()
  const isDark = colorMode === "dark"
  const bg = dayjs(props.day).isSame(dayjs(), "day")
    ? isDark
      ? "orange.900"
      : "orange.100"
    : dayjs(props.day).day() === 6 || dayjs(props.day).day() === 0
    ? isDark
      ? "gray.900"
      : "gray.50"
    : props.index % 2 === 0
    ? isDark
      ? "gray.800"
      : "white"
    : isDark
    ? "gray.800"
    : "white"

  return (
    <>
      <Droppable droppableId={props.day.toString()}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: "min-content" }}>
            <c.Box
              borderRight="1px solid"
              borderColor={isDark ? "gray.700" : "gray.100"}
              minH={`calc(100vh - ${HEADER_HEIGHT}px)`}
              h="100%"
              w={DAY_WIDTH}
              bg={bg}
              pb={2}
            >
              {props.tasks
                .sort((a, b) => a.order - b.order)
                .map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided) => (
                      <div
                        style={{ outline: "none" }}
                        ref={provided.innerRef}
                        key={index}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TaskItem task={task} />
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
              <c.Flex w="100%" justify="center" py={3} flex={1}>
                <c.Text fontSize="xs">{getTotalTaskDuration(props.tasks)}</c.Text>
              </c.Flex>
              <c.Flex _hover={{ opacity: 1 }} opacity={0} w="100%" justify="center" pt={0} flex={1}>
                <c.IconButton
                  variant="ghost"
                  onClick={modalProps.onOpen}
                  borderRadius="full"
                  icon={<c.Box as={IoIosAddCircleOutline} boxSize="24px" />}
                  aria-label="new task"
                />
              </c.Flex>
            </c.Box>
          </div>
        )}
      </Droppable>
      <c.Modal {...modalProps} size="xl">
        <c.ModalOverlay />
        <c.ModalContent borderRadius="md" minH="400px">
          <c.ModalBody mb={4}>
            <TaskForm day={props.day.toISOString()} onClose={modalProps.onClose} />
          </c.ModalBody>
        </c.ModalContent>
      </c.Modal>
    </>
  )
}

export const Day = React.memo(_Day, dayIsEqual)

function dayIsEqual(prevDay: Props, nextDay: Props) {
  return deepEqual(prevDay.tasks, nextDay.tasks)
}

function formatTotalDuration(duration: number) {
  const hours = (duration / 60) | 0
  const minutes = duration % 60 | 0
  const hoursDisplay = hours ? `${hours}h` : ""
  const minutesDisplay = minutes ? `${minutes}m` : ""
  return hoursDisplay + minutesDisplay
}

function getTotalTaskDuration(tasks: TimelineTask[]) {
  const totalMinutes = tasks.reduce(
    (total, task) => total + (task.durationHours || 0) * 60 + (task.durationMinutes || 0),
    0,
  )
  return formatTotalDuration(totalMinutes)
}
