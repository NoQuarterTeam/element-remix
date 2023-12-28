import { ModalView } from "../../../../components/ModalView"

import { useGlobalSearchParams, useRouter } from "expo-router"
import { Trash } from "lucide-react-native"
import { ScrollView, TouchableOpacity, View } from "react-native"
import { ElementForm } from "../../../../components/ElementForm"
import { Icon } from "../../../../components/Icon"
import { Spinner } from "../../../../components/Spinner"
import { Text } from "../../../../components/Text"
import { api } from "../../../../lib/utils/api"
import { useTimelineDays } from "../../../../lib/hooks/useTimelineDays"

export default function ElementDetail() {
  const utils = api.useUtils()
  const router = useRouter()
  const { elementId: id } = useGlobalSearchParams()

  const { data, isLoading } = api.element.byId.useQuery({ id: String(id) }, { enabled: !!id })

  const { daysBack, daysForward } = useTimelineDays()
  const { mutate, isLoading: updateLoading } = api.element.update.useMutation({
    onSuccess: () => {
      void utils.element.byId.refetch({ id: String(id) })
      void utils.element.all.refetch()
      void utils.task.timeline.refetch({ daysBack, daysForward })
      if (router.canGoBack()) {
        router.back()
      } else {
        router.replace("/")
      }
    },
  })

  return (
    <ModalView title="Edit Element">
      {isLoading ? (
        <View className="flex items-center justify-center pt-4">
          <Spinner />
        </View>
      ) : !data ? (
        <View className="pt-4">
          <Text className="text-center">Element not found</Text>
        </View>
      ) : (
        <ScrollView
          className="space-y-4"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 400 }}
          showsVerticalScrollIndicator={false}
        >
          <ElementForm element={data} onUpdate={mutate} isLoading={updateLoading} />
          <View className="flex flex-row items-center justify-center">
            <TouchableOpacity
              onPress={() => mutate({ id: data.id, archivedAt: new Date() })}
              className="rounded-full border border-gray-100 p-4 dark:border-gray-600"
            >
              <Icon icon={Trash} size={24} color="red" />
            </TouchableOpacity>
            {/* <TouchableOpacity
              // onPress={handleAddToBacklog}
              className="rounded-full border border-gray-100 p-4 dark:border-gray-600"
            >
              <Icon icon={CornerUpRight} size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              // onPress={handleDuplicate}
              className="rounded-full border border-gray-100 p-4 dark:border-gray-600"
            >
              <Icon icon={FolderPlus} size={24} />
            </TouchableOpacity> */}
          </View>
        </ScrollView>
      )}
    </ModalView>
  )
}
