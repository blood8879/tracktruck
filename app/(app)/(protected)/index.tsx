import { useSupabase } from "@/context/supabase-provider";
import { router, useNavigation } from "expo-router";
import { useLayoutEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function Home() {
	const navigation = useNavigation();
	const { foodTruck } = useSupabase();

	useLayoutEffect(() => {
		// console.log("foodTruck", foodTruck);
		navigation.setOptions({
			headerTitle: foodTruck?.name || "홈",
		});
	}, [navigation, foodTruck]);

	return (
		<SafeAreaView className="flex-1 items-center justify-center bg-background p-4 gap-y-4">
			<Text className="text-center">Home</Text>
			<Text className="text-center">
				You are now authenticated and this session will persist even after
				closing the app.
			</Text>
			{/* <Button title="Open Modal" onPress={() => router.push("/(app)/modal")} /> */}
		</SafeAreaView>
	);
}
