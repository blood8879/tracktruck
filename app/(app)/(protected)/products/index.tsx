import { useEffect, useState } from "react";
import {
	SafeAreaView,
	Text,
	FlatList,
	StyleSheet,
	View,
	Alert,
} from "react-native";
import { router } from "expo-router";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
import Button from "@/components/ui/Button";
import Toast from "react-native-toast-message";

type Menu = {
	id: string;
	name: string;
	description: string;
	price: number;
	image_url?: string;
};

export default function Products() {
	const [menus, setMenus] = useState<Menu[]>([]);
	const { foodTruck } = useSupabase();

	useEffect(() => {
		if (foodTruck) {
			fetchMenus();
		}
	}, [foodTruck, menus]);

	const fetchMenus = async () => {
		const { data, error } = await supabase
			.from("menu")
			.select("*")
			.eq("food_truck_id", foodTruck?.id)
			.order("created_at", { ascending: false });

		if (!error && data) {
			setMenus(data);
		}
	};

	const renderMenuItem = ({ item }: { item: Menu }) => (
		<View style={styles.menuItem}>
			<View style={{ flexDirection: "row", justifyContent: "space-between" }}>
				<View>
					<Text style={styles.menuName}>{item.name}</Text>
					<Text style={styles.menuDescription}>{item.description}</Text>
					<Text style={styles.menuPrice}>{item.price.toLocaleString()}원</Text>
				</View>
				<View style={styles.menuActions}>
					<Button
						title="수정"
						style={{ marginRight: 8, backgroundColor: "blue" }}
						onPress={() =>
							router.push({
								pathname: "/(app)/(protected)/products/create",
								params: { menuId: item.id },
							})
						}
					/>
					<Button
						title="삭제"
						style={{ backgroundColor: "red" }}
						onPress={() => {
							Alert.alert("메뉴 삭제", "정말 삭제하시겠습니까?", [
								{ text: "취소" },
								{
									text: "삭제",
									onPress: async () => {
										const { error } = await supabase
											.from("menu")
											.delete()
											.eq("id", item.id);

										if (!error) {
											Toast.show({
												type: "success",
												text1: "메뉴가 삭제되었습니다.",
											});
											fetchMenus();
										} else {
											Alert.alert("오류", "메뉴 삭제에 실패했습니다.");
										}
									},
								},
							]);
						}}
					/>
				</View>
			</View>
		</View>
	);

	return (
		<SafeAreaView style={styles.container}>
			<Button
				title="메뉴 등록"
				onPress={() => router.push("/(app)/(protected)/products/create")}
			/>
			{menus.length > 0 ? (
				<FlatList
					data={menus}
					renderItem={renderMenuItem}
					keyExtractor={(item) => item.id}
					style={styles.list}
				/>
			) : (
				<View style={styles.emptyContainer}>
					<Text style={styles.emptyText}>메뉴가 없습니다.</Text>
				</View>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#fff",
	},
	list: {
		marginTop: 16,
	},
	menuItem: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#e5e7eb",
	},
	menuName: {
		fontSize: 18,
		fontWeight: "bold",
	},
	menuDescription: {
		fontSize: 14,
		color: "#6b7280",
		marginTop: 4,
	},
	menuPrice: {
		fontSize: 16,
		color: "#3b82f6",
		marginTop: 4,
	},
	emptyContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	emptyText: {
		fontSize: 16,
		color: "#6b7280",
	},
	menuActions: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 8,
	},
});
