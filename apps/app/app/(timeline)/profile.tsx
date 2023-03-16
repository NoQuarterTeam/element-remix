import AsyncStorage from "@react-native-async-storage/async-storage"
import { Text, View } from "react-native"
import { Button } from "../../components/Button"
import { Modal } from "../../components/Modal"
import { api, AUTH_TOKEN } from "../../lib/utils/api"

export default function Profile() {
  const { data } = api.auth.me.useQuery()
  const queryClient = api.useContext()
  const handleLogout = async () => {
    await AsyncStorage.setItem(AUTH_TOKEN, "")
    queryClient.auth.me.setData(undefined, null)
  }

  return (
    <Modal title="Profile">
      {data && (
        <View className="space-y-4">
          <Text className="text-3xl font-extrabold">Hey, {data.firstName}</Text>
          <Button onPress={handleLogout}>Logout</Button>
        </View>
      )}
    </Modal>
  )
}