import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Modal() {
	return (
		<SafeAreaView>
			<View className="flex flex-1 items-center justify-center bg-background p-4 gap-y-4">
				<Text className="text-center">Modal</Text>
				<Text className="text-center">This is a modal screen.</Text>
			</View>
		</SafeAreaView>
	);
}
