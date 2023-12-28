import { useRouter } from "expo-router"
import type * as React from "react"
import { ScrollView, View } from "react-native"
import { Text } from "./Text"
import { Button } from "./Button"

interface Props {
  text: string
  children?: React.ReactNode
}

export function LoginPlaceholder(props: Props) {
  const router = useRouter()
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View className="space-y-4">
        <View className="space-y-6">
          <Text className="text-lg">{props.text}</Text>
          <View>
            <Button onPress={() => router.push("/login")}>Login</Button>
          </View>
        </View>
        <View>{props.children}</View>
      </View>
    </ScrollView>
  )
}