import { supabase } from "@/config/supabase";

export interface FoodTruck {
	id: number;
	user_id: string;
	name: string;
	description: string;
	created_at: string;
}

export interface CreateFoodTruckDTO {
	name: string;
	description: string;
}

export async function registerFoodTruck({
	name,
	description,
}: CreateFoodTruckDTO) {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	console.log("user", user);

	if (userError || !user) {
		throw new Error("사용자 정보를 가져오지 못했습니다.");
	}

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
	return data as FoodTruck;
}

export async function fetchMyFoodTrucks() {
	const {
		data: { user },
		error: userError,
	} = await supabase.auth.getUser();

	if (userError || !user) {
		throw new Error("사용자 정보를 가져오지 못했습니다.");
	}

	const { data, error } = await supabase
		.from("foodtruck")
		.select("*")
		.eq("user_id", user.id);

	if (error) throw error;
	return data as FoodTruck[];
}
