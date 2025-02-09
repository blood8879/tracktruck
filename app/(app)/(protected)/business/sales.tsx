import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import Button from "@/components/ui/Button";
import Toast from "react-native-toast-message";

type Menu = {
	id: string;
	name: string;
	price: number;
};

export default function Sales() {
	const { foodTruck } = useSupabase();
	const [menus, setMenus] = useState<Menu[]>([]);
	const [businessDay, setBusinessDay] = useState<any>(null);

	useEffect(() => {
		if (foodTruck) {
			fetchMenus();
			fetchTodayBusiness();
		}
	}, [foodTruck]);

	const fetchMenus = async () => {
		const { data } = await supabase
			.from("menu")
			.select()
			.eq("food_truck_id", foodTruck?.id);

		if (data) setMenus(data);
	};

	const fetchTodayBusiness = async () => {
		const today = new Date().toISOString().split("T")[0];
		const { data } = await supabase
			.from("businessday")
			.select()
			.eq("food_truck_id", foodTruck?.id)
			.eq("business_date", today)
			.single();

		if (data) setBusinessDay(data);
	};

	const handleSale = async (menu: Menu) => {
		const { error } = await supabase.from("saledetail").insert([
			{
				business_day_id: businessDay.id,
				menu_id: menu.id,
				quantity: 1,
				price: menu.price,
			},
		]);

		if (!error) {
			Toast.show({
				type: "success",
				text1: `${menu.name} 판매 완료`,
			});

			// 총 매출 업데이트
			await supabase
				.from("businessday")
				.update({
					total_sales: businessDay.total_sales + menu.price,
				})
				.eq("id", businessDay.id);

			fetchTodayBusiness();
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.total}>
				총 매출: {businessDay?.total_sales?.toLocaleString() || 0}원
			</Text>
			<ScrollView style={styles.menuList}>
				{menus.map((menu) => (
					<Button
						key={menu.id}
						title={`${menu.name} (${menu.price.toLocaleString()}원)`}
						onPress={() => handleSale(menu)}
					/>
				))}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: "#fff",
	},
	total: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	menuList: {
		flex: 1,
	},
});
