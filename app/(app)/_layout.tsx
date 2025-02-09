import { Colors } from "@/constants/Colors";
import { useColorScheme as useNativeColorScheme } from "react-native";
import { Stack } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(root)",
};
export default function AppLayout() {
  const colorScheme = useNativeColorScheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="(protected)" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          headerShown: true,
          headerTitle: "Modal",
          headerStyle: {
            backgroundColor:
              colorScheme === "dark"
                ? Colors.dark.background
                : Colors.light.background,
          },
          headerTitleAlign: "center",
          headerTintColor:
            colorScheme === "dark" ? Colors.dark.tint : Colors.light.tint,
          gestureEnabled: true,
        }}
      />
    </Stack>
  );
}
