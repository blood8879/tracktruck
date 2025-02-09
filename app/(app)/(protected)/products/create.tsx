import { useState, useEffect } from "react";
import { SafeAreaView, Text, TextInput, View, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import Button from "@/components/ui/Button";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import Toast from "react-native-toast-message";

export default function CreateProduct() {
	const { menuId } = useLocalSearchParams();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [price, setPrice] = useState("");
	const { foodTruck } = useSupabase();

	useEffect(() => {
		if (menuId) {
			fetchMenu();
		}
	}, [menuId]);

	const fetchMenu = async () => {
		const { data } = await supabase
			.from("menu")
			.select()
			.eq("id", menuId)
			.single();

		if (data) {
			setName(data.name);
			setDescription(data.description || "");
			setPrice(String(data.price));
		}
	};

	const handleSubmit = async () => {
		try {
			if (!foodTruck) throw new Error("푸드트럭 정보가 없습니다.");

			if (menuId) {
				// 수정
				const { error } = await supabase
					.from("menu")
					.update({
						name,
						description,
						price: Number(price),
					})
					.eq("id", menuId);

				if (error) throw error;

				Toast.show({
					type: "success",
					text1: "메뉴가 수정되었습니다.",
				});
			} else {
				// 신규 등록
				const { error } = await supabase.from("menu").insert([
					{
						food_truck_id: foodTruck.id,
						name,
						description,
						price: Number(price),
					},
				]);

				if (error) throw error;

				Toast.show({
					type: "success",
					text1: "메뉴가 등록되었습니다.",
				});
			}

			router.back();
		} catch (error) {
			console.error("메뉴 저장 실패:", error);
			alert("메뉴 저장에 실패했습니다.");
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View>
				<Text style={styles.title}>메뉴 등록</Text>

				<View style={styles.formContainer}>
					<View style={styles.inputContainer}>
						<Text style={styles.inputLabel}>메뉴명</Text>
						<TextInput
							style={styles.input}
							value={name}
							onChangeText={setName}
							placeholder="메뉴명을 입력하세요"
						/>
					</View>

					<View style={styles.inputContainer}>
						<Text style={styles.inputLabel}>설명</Text>
						<TextInput
							style={[styles.input, styles.textArea]}
							value={description}
							onChangeText={setDescription}
							placeholder="메뉴 설명을 입력하세요"
							multiline
						/>
					</View>

					<View style={styles.inputContainer}>
						<Text style={styles.inputLabel}>가격</Text>
						<TextInput
							style={styles.input}
							value={price}
							onChangeText={setPrice}
							placeholder="가격을 입력하세요"
							keyboardType="numeric"
						/>
					</View>

					<Button
						title={menuId ? "메뉴 수정" : "메뉴 등록"}
						onPress={handleSubmit}
						disabled={!name || !price}
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
		marginBottom: 16,
	},
	formContainer: {
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
	textArea: {
		height: 100,
		textAlignVertical: "top",
	},
});
