import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/config/supabase";

export default function SalesModal() {
  const { date, periodType, foodTruckId } = useLocalSearchParams();
  const [salesDetails, setSalesDetails] = useState<any[]>([]);

  useEffect(() => {
    fetchSalesDetails();
  }, []);

  const fetchSalesDetails = async () => {
    let startDate, endDate;

    switch (periodType) {
      case "yearly":
        // 연도별 조회: 해당 연도의 1월 1일부터 12월 31일까지
        const year = date as string;
        startDate = `${year}-01-01`;
        endDate = `${year}-12-31`;
        break;

      case "monthly":
        // 월별 조회: 해당 월의 첫날부터 마지막 날까지
        const [yearMonth, month] = (date as string).split("-");
        startDate = `${yearMonth}-${month}-01`;
        // 마지막 날짜 계산
        const lastDay = new Date(
          parseInt(yearMonth),
          parseInt(month),
          0
        ).getDate();
        endDate = `${yearMonth}-${month}-${lastDay}`;
        break;

      default:
        // 일별 조회
        startDate = date;
        endDate = date;
        break;
    }

    const { data } = await supabase
      .from("orders")
      .select(
        `
        id,
        created_at,
        total_amount,
        orderdetail!orderdetail_order_id_fkey (
          quantity,
          price,
          menu!orderdetail_menu_id_fkey (name)
        )
      `
      )
      .eq("food_truck_id", foodTruckId)
      .eq("status", "complete")
      .gte("created_at", `${startDate}T00:00:00`)
      .lte("created_at", `${endDate}T23:59:59`)
      .order("created_at", { ascending: false });

    if (data) setSalesDetails(data);
  };

  // 총 매출 계산
  const totalSales = salesDetails.reduce(
    (sum, order) => sum + order.total_amount,
    0
  );

  // 타이틀 표시 로직
  const getTitle = () => {
    switch (periodType) {
      case "yearly":
        return `${date}년 매출 내역`;
      case "monthly":
        const [year, month] = (date as string).split("-");
        return `${year}년 ${month}월 매출 내역`;
      default:
        return format(new Date(date as string), "yyyy년 MM월 dd일 매출 내역");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>{getTitle()}</Text>
      <ScrollView style={styles.scrollView}>
        {salesDetails.map((order) => (
          <View key={order.id} style={styles.orderItem}>
            <Text style={styles.orderTime}>
              {format(
                new Date(order.created_at),
                periodType === "yearly"
                  ? "MM/dd HH:mm"
                  : periodType === "monthly"
                  ? "MM/dd HH:mm"
                  : "HH:mm"
              )}
            </Text>
            {order.orderdetail.map((detail: any, index: number) => (
              <Text key={index} style={styles.orderDetail}>
                {detail.menu.name} x {detail.quantity} =
                {(detail.price * detail.quantity).toLocaleString()}원
              </Text>
            ))}
            <Text style={styles.orderTotal}>
              합계: {order.total_amount.toLocaleString()}원
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>
          총 매출: {totalSales.toLocaleString()}원
        </Text>
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  orderItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  orderTime: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  orderDetail: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "right",
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingVertical: 50,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  totalText: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "right",
    color: "#1f2937",
  },
});
