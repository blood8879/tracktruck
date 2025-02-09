import { useState } from "react";
import { SafeAreaView, Text, TextInput, View, StyleSheet } from "react-native";
import { router } from "expo-router";

import Button from "@/components/ui/Button";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

export default function RegisterTruck() {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const { setFoodTruck } = useSupabase();

	const handleRegister = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("사용자 정보가 없습니다.");

			const { data, error } = await supabase
				.from("foodtruck")
				.insert([
					{
						user_id: user.id,
						name,
						description,
					},
				])
				.select()
				.single();

			if (error) throw error;

			setFoodTruck(data);
			router.replace("/(app)/(protected)");
		} catch (error) {
			console.error("푸드트럭 등록 실패:", error);
			alert("푸드트럭 등록에 실패했습니다.");
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View>
				<Text style={styles.title}>팀 생성 및 참여</Text>
				<Text style={styles.subtitle}>
					새로운 팀을 생성하거나 초대 코드로 기존 팀에 참여할 수 있습니다.
				</Text>

				<View style={styles.formContainer}>
					<View style={styles.inputContainer}>
						<Text style={styles.inputLabel}>푸드트럭 이름</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							placeholder="푸드트럭 이름을 입력하세요"
						/>
					</View>

					<View style={styles.inputContainer}>
						<Text style={styles.inputLabel}>설명</Text>
						<TextInput
							style={styles.input}
							value={description}
							onChangeText={setDescription}
							placeholder="푸드트럭 설명을 입력하세요"
							multiline
						/>
					</View>

					<Button
						title="팀 생성하기"
						onPress={handleRegister}
						disabled={!name || !description}
					/>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
	},
	subtitle: {
		fontSize: 16,
		color: "#3b82f6",
		marginTop: 8,
	},
	formContainer: {
		marginTop: 24,
		gap: 16,
	},
	inputContainer: {
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 14,
		marginBottom: 8,
		color: "#374151",
	},
	input: {
		borderWidth: 1,
		borderColor: "#d1d5db",
		borderRadius: 8,
		padding: 12,
		fontSize: 16,
	},
});
