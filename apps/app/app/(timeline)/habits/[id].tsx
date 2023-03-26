import * as React from "react"
import { useRouter, useSearchParams } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { KeyboardAvoidingView, View } from "react-native"
import { ScrollView } from "react-native-gesture-handler"

import { api, RouterOutputs } from "../../../lib/utils/api"
import { Button } from "../../../components/Button"
import { FormError } from "../../../components/FormError"
import { FormInput } from "../../../components/FormInput"
import { ModalView } from "../../../components/ModalView"

type Habit = NonNullable<RouterOutputs["habit"]["byId"]>
export default function HabitDetail() {
  const { id } = useSearchParams()

  const { data, isLoading } = api.habit.byId.useQuery({ id: id as string })

  return (
    <ModalView title="Edit habit">
      {isLoading || !data ? null : <EditHabitForm habit={data} />}
      <StatusBar style="light" />
    </ModalView>
  )
}

function EditHabitForm({ habit }: { habit: Habit }) {
  const router = useRouter()
  const params = useSearchParams()
  const date = params.date as string
  const [name, setName] = React.useState(habit.name)
  const utils = api.useContext()
  const updateHabit = api.habit.update.useMutation({
    onSuccess: async () => {
      void utils.habit.byId.invalidate({ id: habit.id })
      await utils.habit.all.invalidate({ date })
      router.back()
    },
  })

  const handleUpdate = () => {
    updateHabit.mutate({ id: habit.id, name })
  }

  return (
    <KeyboardAvoidingView behavior="padding" enabled keyboardVerticalOffset={100}>
      <ScrollView contentContainerStyle={{ minHeight: "100%", paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <View className="space-y-2">
          <FormInput
            label="Name"
            autoFocus
            value={name}
            error={updateHabit.error?.data?.zodError?.fieldErrors?.name}
            onChangeText={setName}
          />
          <View className="space-y-1">
            <View>
              <Button isLoading={updateHabit.isLoading} size="sm" onPress={handleUpdate}>
                Update
              </Button>
            </View>
            {updateHabit.error?.data?.formError && (
              <View>
                <FormError error={updateHabit.error.data.formError} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
