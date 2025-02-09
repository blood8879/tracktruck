import { Stack } from "expo-router";

export default function ProductsLayout() {
	return (
		<Stack>
			<Stack.Screen name="index" options={{ headerShown: false }} />
			<Stack.Screen
				name="create"
				options={{
					presentation: "modal",
					title: "메뉴 등록",
				}}
			/>
		</Stack>
	);
}
