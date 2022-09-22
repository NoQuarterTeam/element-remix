import { Box, Divider, Flex, Kbd, Text } from "@chakra-ui/react"

export function ShortcutsInfo() {
  return (
    <Box>
      <Text fontWeight={500}>On timeline</Text>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>cmd</Kbd> + <Kbd>.</Kbd>
        </Text>
        <Text fontSize="sm">Create a task</Text>
      </Flex>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>cmd</Kbd> + <Kbd>k</Kbd>
        </Text>
        <Text fontSize="sm">Enter focus mode</Text>
      </Flex>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>cmd</Kbd> + <Kbd>p</Kbd>
        </Text>
        <Text fontSize="sm">Search for tasks</Text>
      </Flex>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>cmd</Kbd> + <Kbd>e</Kbd>
        </Text>
        <Text fontSize="sm">Open element sidebar</Text>
      </Flex>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>cmd</Kbd> + <Kbd>\</Kbd>
        </Text>
        <Text fontSize="sm">Toggle nav</Text>
      </Flex>

      <Divider my={4} />

      <Text fontWeight={500}>On a task</Text>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>cmd</Kbd> + <Kbd>click</Kbd>
        </Text>
        <Text fontSize="sm">Duplicate task</Text>
      </Flex>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>shift</Kbd> + <Kbd>click</Kbd>
        </Text>
        <Text fontSize="sm">Delete task</Text>
      </Flex>
      <Flex align="center" justify="space-between">
        <Text>
          <Kbd>alt</Kbd> + <Kbd>click</Kbd>
        </Text>
        <Text fontSize="sm">Toggle task completion</Text>
      </Flex>
    </Box>
  )
}
