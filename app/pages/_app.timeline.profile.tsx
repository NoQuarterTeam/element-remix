import type * as React from "react"
import { RiBankCard2Line, RiMap2Line, RiSettings2Line } from "react-icons/ri"
import * as c from "@chakra-ui/react"
import { NavLink, Outlet, useNavigate, useTransition } from "@remix-run/react"

import { Modal } from "~/components/ui/Modal"
import { transformImage } from "~/lib/helpers/image"
import { useFeaturesSeen } from "~/lib/hooks/useFeatures"
import { useMe } from "~/pages/_app"

export default function Profile() {
  const me = useMe()
  const navigate = useNavigate()
  const { featuresSeen } = useFeaturesSeen()

  return (
    <Modal size="3xl" isOpen={true} onClose={() => navigate("/timeline")}>
      <c.Flex minH={600} h="100%" overflow="hidden" borderRadius="md">
        <div className="h-auto w-12 bg-gray-50 dark:bg-gray-800 md:w-52">
          <c.Box px={4} py={2}>
            <c.Text fontSize="x-small" noOfLines={1} opacity={0.8} display={{ base: "none", md: "block" }}>
              {me.email}
            </c.Text>
          </c.Box>
          <c.Stack spacing={1}>
            <TabLink
              to="."
              icon={
                <c.Avatar
                  src={me.avatar ? transformImage(me.avatar, "w_30,h_30,g_faces") : undefined}
                  name={me.firstName + " " + me.lastName}
                  size="xs"
                  boxSize="15px"
                />
              }
            >
              Account
            </TabLink>
            <TabLink
              to="settings"
              icon={
                <c.Box pos="relative">
                  <c.Box as={RiSettings2Line} boxSize="15px" />
                  {!featuresSeen.find((u) => ["weather", "habits"].includes(u)) && (
                    <c.Box boxSize="5px" borderRadius="full" bg="red.500" pos="absolute" top="-3px" right="-3px" />
                  )}
                </c.Box>
              }
            >
              Settings
            </TabLink>
            <TabLink to="plan" icon={<c.Box as={RiMap2Line} boxSize="15px" />}>
              Plan
            </TabLink>
            <TabLink to="billing" icon={<c.Box as={RiBankCard2Line} boxSize="15px" />}>
              Billing
            </TabLink>
          </c.Stack>
        </div>
        <c.Box p={4} pb={8} maxH={600} w="100%" overflowY="scroll">
          <Outlet />
        </c.Box>
      </c.Flex>
    </Modal>
  )
}

function TabLink({ children, icon, to }: { to: string; children: string; icon: React.ReactElement<any> | undefined }) {
  const transition = useTransition()

  const isLoading =
    transition.type === "normalLoad" && transition.state === "loading" && transition.location.pathname.includes(to)
  const bg = c.useColorModeValue("gray.100", "gray.700")
  return (
    <NavLink to={to} end={to === "."} style={{ outline: "none" }} prefetch="render">
      {({ isActive }) => (
        <c.Link
          as="span"
          outline="none"
          bg={isActive ? bg : undefined}
          _hover={{ bg }}
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          pl={4}
          h="40px"
          py={1}
          fontWeight={400}
        >
          <c.Center display={{ base: isLoading ? "none" : "flex", md: "flex" }}>{icon}</c.Center>
          <c.Text ml={2} fontSize="sm" as="span" display={{ base: "none", md: "block" }}>
            {children}
          </c.Text>
          {isLoading && <c.Spinner ml={{ base: 0, md: 2 }} size="xs" />}
        </c.Link>
      )}
    </NavLink>
  )
}
