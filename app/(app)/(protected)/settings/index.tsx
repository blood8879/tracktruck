import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSupabase } from "@/context/supabase-provider";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { supabase } from "@/config/supabase";

export default function Settings() {
  const { signOut, foodTruck, refreshFoodTruck } = useSupabase();

  const menuItems = [
    {
      title: "푸드트럭 관리",
      items: [
        {
          label: "트럭 정보 수정",
          icon: "business-outline",
          onPress: () => {
            router.push("/settings/editTruck");
          },
        },
      ],
    },
    {
      title: "지원",
      items: [
        {
          label: "문의하기",
          icon: "help-circle-outline",
          onPress: () => {
            router.push("/settings/contact");
          },
        },
        // {
        //   label: "공지사항",
        //   icon: "notifications-outline",
        //   onPress: () => {
        //     // 공지사항 화면으로 이동
        //   },
        // },
        {
          label: "데이터 삭제",
          icon: "trash-outline",
          onPress: () => {
            Alert.alert(
              "데이터 삭제",
              "모든 데이터가 삭제됩니다. 계속하시겠습니까?",
              [
                { text: "취소" },
                {
                  text: "삭제",
                  style: "destructive",
                  onPress: deleteAllData,
                },
              ]
            );
          },
        },
        {
          label: "로그아웃",
          icon: "log-out-outline",
          onPress: () => {
            Alert.alert("로그아웃", "로그아웃 하시겠습니까?", [
              { text: "취소" },
              {
                text: "로그아웃",
                onPress: signOut,
              },
            ]);
          },
        },
      ],
    },
  ];

  const deleteAllData = async () => {
    try {
      if (!foodTruck?.id) return;

      // 순서대로 삭제 (외래 키 제약조건 때문)
      // 1. 주문 상세 삭제
      await supabase
        .from("orderdetail")
        .delete()
        .eq("food_truck_id", foodTruck.id);

      // 2. 주문 삭제
      await supabase.from("orders").delete().eq("food_truck_id", foodTruck.id);

      // 3. 메뉴 삭제
      await supabase.from("menu").delete().eq("food_truck_id", foodTruck.id);

      await refreshFoodTruck();
      Alert.alert("완료", "모든 데이터가 삭제되었습니다.");
    } catch (error) {
      console.error("Error deleting data:", error);
      Alert.alert("오류", "데이터 삭제 중 문제가 발생했습니다.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#6366f1", "#3b82f6"]} style={styles.header}>
        <View style={styles.truckInfo}>
          <Text style={styles.truckName}>
            {foodTruck?.name || "푸드트럭 이름"}
          </Text>
        </View>
        {/* {foodTruck?.image_url ? (
					<Image
						source={{ uri: foodTruck.image_url }}
						style={styles.truckImage}
					/>
				) : (
					<View style={[styles.truckImage, styles.placeholderImage]}>
						<Ionicons name="business" size={24} color="#fff" />
					</View>
				)} */}
      </LinearGradient>

      {menuItems.map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemContent}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.label === "데이터 삭제" ? "#ef4444" : "#4b5563"}
                />
                <Text
                  style={[
                    styles.menuItemLabel,
                    item.label === "데이터 삭제" && styles.deleteText,
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  truckInfo: {
    flex: 1,
  },
  truckName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  truckStats: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.9,
  },
  truckImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    marginTop: 24,
    backgroundColor: "#fff",
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemLabel: {
    fontSize: 16,
    marginLeft: 12,
    color: "#1f2937",
  },
  deleteText: {
    color: "#ef4444",
  },
});
