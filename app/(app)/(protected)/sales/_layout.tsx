import { Stack } from "expo-router";

export default function SalesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="salesModal"
        options={{
          presentation: "modal",
          title: "매출 상세",
        }}
      />
    </Stack>
  );
}
