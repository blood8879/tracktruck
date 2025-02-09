import { Stack } from "expo-router";

export default function ProductsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="editTruck"
        options={{ headerShown: true, title: "트럭 정보 수정" }}
      />
      <Stack.Screen
        name="contact"
        options={{ headerShown: true, title: "문의하기" }}
      />
    </Stack>
  );
}
